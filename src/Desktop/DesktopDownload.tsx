// DesktopDownload.tsx — /signin (also /desktop, /desktop-signin)
// Sign-in helper page. Google blocks Google-account login inside embedded
// webviews, so a downloadable desktop app can't sign you in. Instead we point
// users at the Firefox extension, which signs you in inside a private window,
// reads that window's session cookies, and shows a QR the Dumb Down app scans.
// Private windows are required: Google rotates the session cookie ~every 30 min
// and only one holder can rotate it, so a login taken from the everyday profile
// gets the flip phone signed out shortly after.
//
// Firefox only. Any other browser is blocked and told to open this page in
// Firefox.
import { useEffect, useState } from "react";
import styles from "../Android/index.module.css";

// Mozilla-signed .xpi, self-hosted on dumb.co (downloaded from AMO and committed
// under public/downloads/). Firefox installs it from any HTTPS origin because
// it's Mozilla-signed.
const FIREFOX_XPI_URL = "https://dumb.co/downloads/dumb-down-login-1.5.6.xpi";

// Headers use Helvetica (overrides the site's default typewriter heading font).
const HELVETICA = '"Helvetica Neue", Helvetica, Arial, sans-serif';

// True only for real desktop Firefox. Mobile Firefox can't install/run this
// extension, so it's excluded too.
function isFirefoxDesktop(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
  if (isMobile) return false;
  return /Firefox\//.test(ua) && !/Seamonkey\//.test(ua);
}

// Where we send people to get Firefox.
const FIREFOX_DOWNLOAD_URL = "https://www.mozilla.org/firefox/new/";

export default function DesktopDownload() {
  const [firefoxOk, setFirefoxOk] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setFirefoxOk(isFirefoxDesktop());
  }, []);

  async function copyExtensionUrl() {
    try {
      await navigator.clipboard.writeText(FIREFOX_XPI_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (e.g. insecure context) — leave the visible URL so
      // the user can select it manually.
    }
  }

  // Pre-detection render (SPA hydration): keep it neutral, no flash of the
  // wrong state.
  if (firefoxOk === null) {
    return (
      <div className={styles.page} style={{ flexDirection: "column", gap: 0 }}>
        <div className={styles.card} style={{ marginBottom: 20 }}>
          <p className={styles.markdown}>Loading…</p>
        </div>
      </div>
    );
  }

  // Same "How it works" steps for both states (Firefox installs via the button;
  // other browsers copy the extension link and paste it into Firefox).
  const howItWorks = (
    <div className={styles.markdown}>
      <h2 style={{ fontFamily: HELVETICA }}>How it works</h2>
      <ol>
        <li>
          Install the extension in Firefox — use the button above, or paste the
          copied extension link into Firefox’s address bar and press Enter.
        </li>
        <li>
          Firefox shows an install pop-up. Before you click <strong>Add</strong>
          , tick the box{" "}
          <strong>“Allow extension to run in private windows.”</strong> This is
          required — the sign-in won’t work without it. Then click{" "}
          <strong>Add</strong>.
        </li>
        <li>
          Click the duck icon in your toolbar (if you don’t see it, open the
          puzzle-piece <em>Extensions</em> menu and pin it). Sign into Google in
          the <strong>private window</strong> it opens — the QR code then
          appears there automatically.
        </li>
        <li>In the Dumb Down app, tap “scan desktop code” and scan it.</li>
        <li>
          Once your phone confirms, <strong>close the private window</strong>{" "}
          (red button on the QR page) — this keeps your phone signed in.
        </li>
      </ol>
      <p style={{ fontSize: 14, opacity: 0.8 }}>
        Why private windows? Google rotates your session cookie every ~30
        minutes and only one place can hold it. Signing in from a private window
        keeps your everyday Firefox session separate, so your flip phone stays
        logged in. If you skipped the “Allow … in private windows” box, open{" "}
        <code>about:addons</code>, click this extension, and turn it on.
      </p>
    </div>
  );

  return (
    <div
      className={`${styles.page} ffHelveticaAll`}
      style={{ flexDirection: "column", gap: 0 }}
    >
      {/* Force the whole page — including <code> snippets that default to
          monospace — to Helvetica. Scoped to this page; shared CSS untouched. */}
      <style>{`.ffHelveticaAll, .ffHelveticaAll * { font-family: ${HELVETICA} !important; }`}</style>
      <div style={{ width: 720, maxWidth: "100%", marginBottom: 24 }}>
        <div className={styles.badge}>Firefox extension</div>
        <h1 className={styles.h1} style={{ fontFamily: HELVETICA }}>
          Sign in with the Firefox extension
        </h1>
      </div>

      <div className={styles.card} style={{ marginBottom: 20 }}>
        <div className={styles.header}>
          <h2
            className={styles.h1}
            style={{ fontSize: 22, fontFamily: HELVETICA }}
          >
            Dumb Down — Google Messages login helper
          </h2>
        </div>

        {/* ---- Not Firefox: notice + get-Firefox/copy buttons + same steps ---- */}
        {!firefoxOk && (
          <>
            <div className={styles.notice} style={{ marginTop: 12 }}>
              <strong>This only works in Mozilla Firefox on a computer.</strong>{" "}
              You’re using a browser that can’t install it. Get Firefox, then
              copy the extension and paste it into Firefox’s address bar to
              install it directly.
            </div>

            <div
              style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4 }}
            >
              <a
                href={FIREFOX_DOWNLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.button} ${styles.downloadButton}`}
              >
                Download Firefox ↗
              </a>
              <button
                type="button"
                onClick={copyExtensionUrl}
                className={styles.button}
              >
                {copied ? "Copied! Paste in Firefox" : "Copy extension"}
              </button>
            </div>

            <hr className={styles.hr} />

            {howItWorks}
          </>
        )}

        {/* ---- Firefox: direct .xpi install ---- */}
        {firefoxOk && (
          <>
            <a
              href={FIREFOX_XPI_URL}
              className={`${styles.button} ${styles.downloadButton}`}
            >
              Add to Firefox ↗
            </a>

            <hr className={styles.hr} />

            {howItWorks}
          </>
        )}
      </div>
    </div>
  );
}
