// AndroidDownload.tsx
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import contentRaw from "./android.md?raw";
import styles from "./index.module.css";

type VersionInfo = {
  latest_version?: string;
  version?: string;
  apk_url?: string;
  required?: boolean;
  notes?: string;
  sha256?: string;
  published_at?: string;
} | null;

const APK_URL = "https://dumb.co/downloads/DumbCo-Android-latest.apk";
const VERSION_URL = "https://dumb.co/downloads/version.json";

function isAndroidUA(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

function browserName(): string {
  if (typeof navigator === "undefined") return "your browser";
  const ua = navigator.userAgent;
  if (/SamsungBrowser/i.test(ua)) return "Samsung Internet";
  if (/Firefox/i.test(ua)) return "Firefox";
  if (/Chrome|Chromium|CriOS/i.test(ua)) return "Chrome";
  return "your browser";
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

export default function AndroidDownload() {
  const [isAndroid, setIsAndroid] = useState(true);
  const [browser, setBrowser] = useState("your browser");
  const [apkSize, setApkSize] = useState<number | null>(null);
  const [versionInfo, setVersionInfo] = useState<VersionInfo>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsAndroid(isAndroidUA());
    setBrowser(browserName());

    // Optional: fetch version.json (ignore failures)
    fetch(VERSION_URL, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j && setVersionInfo(j))
      .catch(() => {});

    // Optional: fetch HEAD to get size (ignore failures)
    fetch(APK_URL, { method: "HEAD" })
      .then((r) => {
        const len = r.headers.get("content-length");
        if (len) setApkSize(parseInt(len, 10));
      })
      .catch(() => {});
  }, []);

  const latestVersion = useMemo(() => {
    return versionInfo?.latest_version ?? versionInfo?.version ?? null;
  }, [versionInfo]);

  const sha256 = useMemo(() => {
    return versionInfo?.sha256 ?? null;
  }, [versionInfo]);

  const downloadLabel = useMemo(() => {
    const parts: string[] = ["Download APK"];
    if (latestVersion) parts.push(`v${latestVersion}`);
    const sizeStr = formatBytes(apkSize);
    if (sizeStr) parts.push(sizeStr);
    return parts.join(" • ");
  }, [latestVersion, apkSize]);

  const markdown = useMemo(() => {
    // Let the markdown be mostly static, but we can inject variables.
    // Keep this *simple* so the .md stays readable.
    return contentRaw
      .replaceAll("{{APK_URL}}", APK_URL)
      .replaceAll("{{BROWSER}}", browser)
      .replaceAll("{{VERSION}}", latestVersion ?? "latest")
      .replaceAll("{{SHA256}}", sha256 ?? "—");
  }, [browser, latestVersion, sha256]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(APK_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.badge}>Android</div>
          <h1 className={styles.h1}>Install Dumb Down App</h1>
        </div>

        {!isAndroid && (
          <div className={styles.notice}>
            <strong>Not on Android?</strong> This installer is for Android
            phones. Open this page on your Android device to install.
          </div>
        )}

        <a
          href={APK_URL}
          className={`${styles.button} ${!isAndroid ? styles.buttonDisabled : ""}`}
          onClick={(e) => {
            if (!isAndroid) e.preventDefault();
          }}
        >
          {downloadLabel}
        </a>

        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <div className={styles.metaLabel}>Direct link</div>
            <div className={styles.linkRow}>
              <code className={styles.codeSmall}>{APK_URL}</code>
              <button
                className={styles.copyBtn}
                onClick={copyLink}
                type="button"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {sha256 && sha256 !== "—" && (
            <div className={styles.metaItem}>
              <div className={styles.metaLabel}>SHA-256</div>
              <code className={styles.code}>{sha256}</code>
            </div>
          )}
        </div>

        <hr className={styles.hr} />

        <div className={styles.markdown}>
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>

        <div className={styles.footer}>
          <span className={styles.footerText}>
            Questions? Email{" "}
            <a className={styles.footerLink} href="mailto:support@dumb.co">
              support@offline.community
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
