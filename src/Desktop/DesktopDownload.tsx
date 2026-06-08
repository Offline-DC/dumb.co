// DesktopDownload.tsx — /signin (also /desktop, /desktop-signin)
// Sign-in helper page. Google blocks Google-account login inside embedded
// webviews, so a downloadable desktop app can't sign you in. Instead we point
// users at the Chrome extension, which runs in their REAL Chrome where Google
// login works normally, reads the session cookies, and shows a QR the Dumb
// Down app scans. This page just gets them to the extension — and tells them
// it has to be Google Chrome.
import { useEffect, useState } from "react";
import styles from "../Android/index.module.css";

// Chrome Web Store listing for the "Dumb Down — Google Messages login helper".
const EXTENSION_URL =
  "https://chromewebstore.google.com/detail/dumb-down-%E2%80%94-google-messag/jpdaemdfdgcolaakbdmkcolcdgfchjaa";

// Headers use Helvetica (overrides the site's default typewriter heading font).
const HELVETICA = '"Helvetica Neue", Helvetica, Arial, sans-serif';

// Chromium-based desktop browsers (Chrome, Edge, Brave, Arc, Opera) can install
// Chrome Web Store extensions. Firefox/Safari and all mobile browsers can't.
function isChromeCapable(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
  const isChromiumOniOS = /CriOS|EdgiOS|FxiOS/i.test(ua); // Chrome-on-iOS, etc.
  return /Chrome\//.test(ua) && !isChromiumOniOS && !isMobile;
}

export default function DesktopDownload() {
  const [chromeOk, setChromeOk] = useState<boolean | null>(null);

  useEffect(() => {
    setChromeOk(isChromeCapable());
  }, []);

  return (
    <div className={styles.page} style={{ flexDirection: "column", gap: 0 }}>
      <div style={{ width: 720, maxWidth: "100%", marginBottom: 24 }}>
        <div className={styles.badge}>Chrome extension</div>
        <h1 className={styles.h1} style={{ fontFamily: HELVETICA }}>
          Sign in with the Chrome extension
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

        {chromeOk === false && (
          <div className={styles.notice} style={{ marginTop: 12 }}>
            <strong>This only works in Google Chrome on a computer.</strong> You
            don't appear to be using Chrome right now. Open{" "}
            <code>dumb.co/signin</code> in Chrome, then come back to this button.
          </div>
        )}

        <a
          href={EXTENSION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.button} ${styles.downloadButton}`}
          style={chromeOk === false ? { opacity: 0.85 } : undefined}
        >
          {chromeOk === false
            ? "Open the extension page (needs Chrome) ↗"
            : "Add to Chrome ↗"}
        </a>

        <hr className={styles.hr} />

        <div className={styles.markdown}>
          <h2 style={{ fontFamily: HELVETICA }}>How it works</h2>
          <ol>
            <li>
              In <strong>Google Chrome</strong>, click “Add to Chrome” above and
              install the extension.
            </li>
            <li>
              Sign into your Google account at{" "}
              <code>messages.google.com</code>.
            </li>
            <li>
              Click the Dumb Down extension icon — a big QR code opens in a new
              tab.
            </li>
            <li>
              In the Dumb Down app on your phone, tap “scan desktop code” and
              point the camera at the QR.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
