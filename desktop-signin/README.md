# Dumb Down — Google Messages sign-in (desktop)

A tiny cross-platform (macOS + Windows) desktop helper for people who hit
Google's "this browser or app may not be secure" block when signing in inside
the Dumb Down Android companion. Sign into Google on a real computer here, and
the app shows a **QR code** that the companion scans to get the login.

## Why a desktop app and not a web page

Google's Messages-for-web session cookies (`SID`, `HSID`, `OSID`, `SSID`,
`APISID`, `SAPISID`, …) are **HttpOnly** and scoped to `.google.com`. A normal
web page can't read them (cross-origin + HttpOnly). Only software that *owns*
its browser context can — a browser extension, the Android WebView, or a
desktop app's webview. This is the desktop-webview option (Beeper Desktop does
the same thing with Electron; this is the lighter Tauri version).

## How it works

1. Opens Google login in a Tauri webview window (real desktop-Chrome UA so
   Google doesn't block it).
2. After sign-in, reads that webview's cookies — HttpOnly included — via Tauri's
   `Webview::cookies()` API.
3. Renders the cookies as a QR code (`name=value; …` cookie blob).
4. The Dumb Down Android companion scans it (Smart Txt → "sign in with desktop"
   → "scan QR code"), then forwards the login to the flip phone over its
   existing relay. **This app never touches the relay or the flip itself.**

The QR payload is exactly what the companion's existing scanner expects (the
same format its browser-extension path uses).

## Theme

Matches the Dumb Down Android app: black background, DumbYellow (`#FAF594`)
accent, Cheltenham Extra Condensed Bold headers, Helvetica Now Text Black body.
Fonts are bundled in `src/fonts/`. The window icon is built from
`dumb.co/public/duck_logo.png` (see `src-tauri/icons/`).

## Develop

Prereqs: Rust (stable) + the Tauri 2 system deps for your OS
(https://tauri.app/start/prerequisites/), and Node (for the Tauri CLI).

```bash
cd desktop-signin
npm install
npm run dev
```

Replace the placeholder icon anytime:

```bash
cargo tauri icon path/to/icon.png   # regenerates icons/* from one PNG
```

## Build installers locally

```bash
npm run build
```

Outputs in `src-tauri/target/release/bundle/` — `dmg/…​.dmg` (macOS),
`nsis/…-setup.exe` (Windows). Build each OS's installer on that OS. Universal
macOS binary:

```bash
rustup target add aarch64-apple-darwin x86_64-apple-darwin
npm run tauri build -- --target universal-apple-darwin
```

## Release (CI)

`.github/workflows/desktop.yml` (in the dumb.co repo) builds macOS + Windows
via `tauri-apps/tauri-action` and publishes the installers to a GitHub Release
on `Offline-DC/dumb.co`. The dumb.co `/desktop` page reads the latest release
and offers the `.dmg` / `.exe` (matched by extension, so the exact filenames
don't matter).

Trigger it from the Actions tab (**Build desktop sign-in app** → Run workflow),
or push a tag like `desktop-v0.1.0`.

## Code signing (so users don't get scary warnings)

Unsigned builds run but show Gatekeeper / SmartScreen warnings. To sign, add the
secrets and uncomment the `env:` block in `desktop.yml`:

- **macOS**: Apple Developer ID + notarization — `APPLE_CERTIFICATE`,
  `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`,
  `APPLE_PASSWORD` (app-specific), `APPLE_TEAM_ID`.
  https://tauri.app/distribute/sign/macos/
- **Windows**: a code-signing cert or free Azure Trusted Signing.
  https://tauri.app/distribute/sign/windows/
