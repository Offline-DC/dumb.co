// FSADownload.tsx — /fsa
// Landing + download page for "Dumb Security Key", the little desktop helper
// that answers Apple's FSA (security-key) sign-in challenge with a USB security
// key and relays the assertion back to the dumbphone, so signing in to smart
// txt can finish. A browser can't do this (WebAuthn is origin-bound and blocks
// raw HID), so it's a native app. Ships PORTABLE — a zipped macOS .app and a
// bare Windows .exe, no installer.
//
// Design mirrors the /signin helper (DesktopDownload): Helvetica headings, the
// shared Android card styles, a "How it works" list, a support footer. The page
// shows only the download for the OS you're on, with a small link to the other.
import { useEffect, useState } from "react";
import styles from "../Android/index.module.css";

// Functional links are root-relative so they resolve against whatever origin is
// serving the page: the real files in public/downloads/ during local `npm run
// dev`, and https://dumb.co/downloads/... once deployed.
const MACOS_PATH = "/downloads/Dumb-Security-Key-macOS.zip";
const WINDOWS_PATH = "/downloads/Dumb-Security-Key-Windows.exe";
const FSA_JSON_PATH = "/downloads/fsa.json";

// Headings use Helvetica (overrides the site's default typewriter font), the
// same treatment the /signin helper page uses.
const HELVETICA = '"Helvetica Neue", Helvetica, Arial, sans-serif';

type OS = "macos" | "windows" | "other";

type FsaMeta = {
  latest_version?: string;
  published_at?: string;
} | null;

const NAME: Record<"macos" | "windows", string> = {
  macos: "macOS",
  windows: "Windows",
};
const SUBLINE: Record<"macos" | "windows", string> = {
  macos: "Apple silicon + Intel · .zip · macOS 11+",
  windows: "64-bit · .exe · Windows 10+",
};
const PATH: Record<"macos" | "windows", string> = {
  macos: MACOS_PATH,
  windows: WINDOWS_PATH,
};

function detectOS(): OS {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  // Mobile can't run the desktop app — treat as "other" and show a notice.
  if (/Android|iPhone|iPad|iPod/i.test(ua)) return "other";
  if (/Windows|Win64|Win32|WOW64/i.test(ua)) return "windows";
  if (/Mac OS X|Macintosh|Mac_PowerPC/i.test(ua)) return "macos";
  return "other";
}

function isMobileUA(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
}

function formatBytes(bytes: number | null): string | null {
  if (bytes == null || Number.isNaN(bytes)) return null;
  const units = ["B", "KB", "MB", "GB"] as const;
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function FSADownload() {
  const [os, setOs] = useState<OS | null>(null);
  const [mobile, setMobile] = useState(false);
  const [meta, setMeta] = useState<FsaMeta>(null);
  const [size, setSize] = useState<Record<"macos" | "windows", number | null>>({
    macos: null,
    windows: null,
  });

  useEffect(() => {
    setOs(detectOS());
    setMobile(isMobileUA());

    // Optional: version (ignore failures — downloads still work).
    fetch(FSA_JSON_PATH, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j && setMeta(j))
      .catch(() => {});

    // Optional: HEAD each file for its size (ignore failures). Root-relative so
    // it measures the file on the origin actually serving this page.
    (["macos", "windows"] as const).forEach((key) => {
      fetch(PATH[key], { method: "HEAD" })
        .then((r) => {
          const len = r.headers.get("content-length");
          if (len) setSize((s) => ({ ...s, [key]: parseInt(len, 10) }));
        })
        .catch(() => {});
    });
  }, []);

  const version = meta?.latest_version ?? null;

  // Pre-detection render (SPA hydration): keep it neutral so there's no flash
  // of the wrong platform.
  if (os === null) {
    return (
      <div className={styles.page} style={{ flexDirection: "column", gap: 0 }}>
        <div className={styles.card}>
          <p className={styles.markdown}>Loading…</p>
        </div>
      </div>
    );
  }

  function downloadLabel(key: "macos" | "windows") {
    const sizeStr = formatBytes(size[key]);
    return (
      `Download for ${NAME[key]}` +
      (version ? ` · v${version}` : "") +
      (sizeStr ? ` · ${sizeStr}` : "")
    );
  }

  // The platform we detected (if it's one we ship). When we can't tell (Linux,
  // mobile), `current` is null and we fall back to offering both.
  const current: "macos" | "windows" | null =
    os === "macos" || os === "windows" ? os : null;
  const other: "macos" | "windows" | null =
    current === "macos" ? "windows" : current === "windows" ? "macos" : null;

  return (
    <div
      className={`${styles.page} ffHelveticaAll`}
      style={{ flexDirection: "column", gap: 0 }}
    >
      {/* Force the whole page — including <code> snippets that default to
          monospace — to Helvetica. Scoped to this page; shared CSS untouched. */}
      <style>{`.ffHelveticaAll, .ffHelveticaAll * { font-family: ${HELVETICA} !important; }`}</style>

      <div style={{ width: 720, maxWidth: "100%", marginBottom: 24 }}>
        <div className={styles.badge}>Security key</div>
        <h1 className={styles.h1} style={{ fontFamily: HELVETICA }}>
          Sign in with your security key
        </h1>
      </div>

      <div className={styles.card} style={{ marginBottom: 20 }}>
        <div className={styles.header}>
          <h2
            className={styles.h1}
            style={{ fontSize: 22, fontFamily: HELVETICA }}
          >
            Download Dumb Security Key
          </h2>
        </div>

        {mobile && (
          <div className={styles.notice}>
            <strong>This is a desktop app.</strong> Open this page on your Mac or
            Windows computer to download it, and keep your USB security key
            handy.
          </div>
        )}

        {current ? (
          // Show only the OS you're on.
          <>
            <a
              href={PATH[current]}
              className={`${styles.button} ${styles.downloadButton}`}
            >
              {downloadLabel(current)}
            </a>
            <div
              style={{
                fontSize: 13,
                opacity: 0.75,
                marginTop: 10,
                textAlign: "center",
              }}
            >
              {SUBLINE[current]}
            </div>
          </>
        ) : (
          // Couldn't detect a shipped OS (Linux / mobile) — offer both.
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              href={MACOS_PATH}
              className={`${styles.button} ${styles.downloadButton}`}
              style={{ flex: 1 }}
            >
              {downloadLabel("macos")}
            </a>
            <a
              href={WINDOWS_PATH}
              className={`${styles.button} ${styles.downloadButton}`}
              style={{ flex: 1 }}
            >
              {downloadLabel("windows")}
            </a>
          </div>
        )}

        {/* Little link at the bottom for the other platform. */}
        {other && (
          <div
            style={{
              marginTop: 16,
              textAlign: "center",
              fontSize: 13,
              opacity: 0.8,
            }}
          >
            <a
              href={PATH[other]}
              style={{ color: "inherit", textDecoration: "underline" }}
            >
              Download for {NAME[other]} instead
            </a>
          </div>
        )}

        <div className={styles.footer}>
          <span className={styles.footerText}>
            Questions? Email{" "}
            <a
              className={styles.footerLink}
              href="mailto:support@dumb.co"
              style={{ textDecoration: "underline" }}
            >
              support@dumb.co
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
