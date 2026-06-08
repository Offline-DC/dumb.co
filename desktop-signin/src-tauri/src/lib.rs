//! Dumb Down — Google Messages sign-in helper (desktop).
//!
//! For accounts where Google blocks the Android companion's in-app WebView
//! ("this browser or app may not be secure"), the user signs into Google on a
//! real computer here. We open Google login in a Tauri webview, read its
//! cookies — HttpOnly included — via Tauri's `cookies()` API, then show them as
//! a big QR code in a separate maximized window. The Dumb Down Android
//! companion scans that QR (its "sign in with desktop" flow) and forwards the
//! login to the flip phone. This app never talks to the relay or the flip.

use std::collections::HashMap;
use std::sync::Mutex;

use qrcode::render::svg;
use qrcode::{EcLevel, QrCode};
use tauri::webview::PageLoadEvent;
use tauri::{Manager, State, WebviewUrl, WebviewWindowBuilder};

// The EXACT cookie set the working browser-extension sends (and the in-app
// WebView used). Sending only these keeps the QR small enough to scan AND
// complete enough for Google's SignInGaia — sending all google.com cookies
// overflows the QR, and a smaller subset gets rejected with
// SESSION_COOKIE_INVALID (Google cross-checks the *SIDCC / NID cookies).
const WANTED_COOKIES: [&str; 17] = [
    "SID", "HSID", "SSID", "APISID", "SAPISID", "OSID", "SIDCC", "NID",
    "__Secure-1PSID", "__Secure-3PSID",
    "__Secure-1PSIDTS", "__Secure-3PSIDTS",
    "__Secure-1PSIDCC", "__Secure-3PSIDCC",
    "__Secure-OSID", "__Secure-1PAPISID", "__Secure-3PAPISID",
];

// Must all be present before we'll show a QR (means the user is signed in).
const CRITICAL_COOKIES: [&str; 5] = ["SID", "SAPISID", "APISID", "HSID", "SSID"];

const DESKTOP_UA: &str = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) \
AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36";

const LOGIN_URL: &str =
    "https://accounts.google.com/AccountChooser?continue=https://messages.google.com/web/config";

/// Holds the most recently rendered QR SVG so the fullscreen QR window can fetch
/// it after it opens.
#[derive(Default)]
struct QrState(Mutex<Option<String>>);

/// Open (or focus) the Google sign-in webview window.
#[tauri::command]
async fn open_login(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("login") {
        let _ = w.set_focus();
        return Ok(());
    }
    let url = LOGIN_URL.parse().map_err(|e| format!("bad login url: {e}"))?;
    WebviewWindowBuilder::new(&app, "login", WebviewUrl::External(url))
        .title("Sign in to Google")
        .inner_size(480.0, 660.0)
        .user_agent(DESKTOP_UA)
        // As soon as the user reaches messages.google.com (i.e. signed in),
        // auto-render the QR and close this window — no manual button, and the
        // raw /web/config page never lingers on screen.
        .on_page_load(|webview, payload| {
            if payload.event() == PageLoadEvent::Finished
                && payload.url().as_str().contains("messages.google.com")
            {
                // Ignore the error case (cookies not set yet on an intermediate
                // page) — we'll try again on the next finished load.
                let _ = present_qr(&webview.app_handle().clone());
            }
        })
        .build()
        .map_err(|e| format!("couldn't open the sign-in window: {e}"))?;
    Ok(())
}

/// Read the login cookies, render the QR, and open a maximized window showing
/// it big for the phone to scan. Errors (listing what's missing) if not signed
/// in yet.
/// Manual fallback (the "Show the QR code" button) — same as the automatic path.
#[tauri::command]
async fn open_qr_window(app: tauri::AppHandle) -> Result<(), String> {
    present_qr(&app)
}

/// Fetched by the QR window (qr.js) once it loads.
#[tauri::command]
fn get_qr_svg(state: State<'_, QrState>) -> Option<String> {
    state.0.lock().ok().and_then(|g| g.clone())
}

// ---- helpers ----

/// Render the QR from the login window's cookies, show it in a maximized window,
/// and close the now-unneeded Google sign-in window. Errors (kept for the manual
/// path; ignored on auto) if the user isn't signed in yet.
fn present_qr(app: &tauri::AppHandle) -> Result<(), String> {
    let svg = build_qr_svg(app)?;
    *app.state::<QrState>().0.lock().map_err(|_| "state poisoned".to_string())? = Some(svg);

    if let Some(w) = app.get_webview_window("qr") {
        let _ = w.set_focus();
        let _ = w.eval("window.location.reload()");
    } else {
        WebviewWindowBuilder::new(app, "qr", WebviewUrl::App("qr.html".into()))
            .title("Scan this with your phone")
            .maximized(true)
            .build()
            .map_err(|e| format!("couldn't open the QR window: {e}"))?;
    }

    // Close the Google sign-in window (deferred to the main thread so we don't
    // tear it down from inside its own page-load callback).
    let app2 = app.clone();
    let _ = app.run_on_main_thread(move || {
        if let Some(w) = app2.get_webview_window("login") {
            let _ = w.close();
        }
    });
    Ok(())
}

fn build_qr_svg(app: &tauri::AppHandle) -> Result<String, String> {
    let wv = app
        .get_webview_window("login")
        .ok_or_else(|| "the Google sign-in window isn't open".to_string())?;
    let cookies = wv
        .cookies()
        .map_err(|e| format!("couldn't read cookies: {e}"))?;

    // There can be MULTIPLE cookies with the same name scoped to different
    // domains (e.g. an OSID for messages.google.com AND the account-wide
    // `.google.com` one). SignInGaia needs the account-wide `.google.com`
    // values, so when a name repeats prefer the cookie whose domain is the
    // broadest google.com (leading dot). Last-wins with undefined order
    // (the previous behavior) could pick the wrong one → SESSION_COOKIE_INVALID.
    fn domain_rank(domain: Option<&str>) -> i32 {
        match domain {
            Some(d) if d == ".google.com" || d == "google.com" => 3,
            Some(d) if d.ends_with(".google.com") => 1,
            Some(_) => 0,
            None => 0,
        }
    }

    let mut map: HashMap<String, String> = HashMap::new();
    let mut rank: HashMap<String, i32> = HashMap::new();
    eprintln!("[gsignin] --- raw cookies from webview ---");
    for c in cookies {
        let name = c.name().to_string();
        let dom = c.domain();
        let val = c.value().to_string();
        if WANTED_COOKIES.contains(&name.as_str()) || CRITICAL_COOKIES.contains(&name.as_str()) {
            let r = domain_rank(dom);
            eprintln!(
                "[gsignin] {name} domain={:?} len={} rank={r}",
                dom,
                val.len()
            );
            let better = r >= *rank.get(&name).unwrap_or(&-1);
            if better {
                rank.insert(name.clone(), r);
                map.insert(name, val);
            }
        }
    }

    let missing: Vec<&str> = CRITICAL_COOKIES
        .iter()
        .copied()
        .filter(|name| map.get(*name).map(|v| v.is_empty()).unwrap_or(true))
        .collect();
    if !missing.is_empty() {
        return Err(format!(
            "Not signed in yet (missing {}). Finish signing into messages.google.com in the other window, then try again.",
            missing.join(", ")
        ));
    }

    // Send ONLY the wanted set (matches the working extension). No silent
    // subset fallback — if it somehow won't fit, surface the error rather than
    // shipping an incomplete login that Google rejects.
    let blob = join_cookies(&map, &|name| WANTED_COOKIES.contains(&name));
    eprintln!("[gsignin] sending {} cookies, blob {} chars", map.len(), blob.len());
    encode_svg(&blob)
}

fn join_cookies(map: &HashMap<String, String>, keep: &dyn Fn(&str) -> bool) -> String {
    let mut parts: Vec<String> = map
        .iter()
        .filter(|(k, v)| keep(k) && !v.is_empty())
        .map(|(k, v)| format!("{k}={v}"))
        .collect();
    parts.sort();
    parts.join("; ")
}

fn encode_svg(data: &str) -> Result<String, String> {
    let code = QrCode::with_error_correction_level(data.as_bytes(), EcLevel::L)
        .map_err(|e| format!("the login is too large to fit in a QR code: {e}"))?;
    let svg = code
        .render::<svg::Color>()
        .min_dimensions(512, 512)
        .quiet_zone(true)
        .dark_color(svg::Color("#000000"))
        .light_color(svg::Color("#ffffff"))
        .build();
    Ok(svg)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(QrState::default())
        .invoke_handler(tauri::generate_handler![open_login, open_qr_window, get_qr_svg])
        .run(tauri::generate_context!())
        .expect("error while running the Dumb Down sign-in app");
}
