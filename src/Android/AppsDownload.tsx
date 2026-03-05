// AppsDownload.tsx
import { useEffect, useState } from "react";
import styles from "./index.module.css";

const APPS_JSON_URL = "https://dumb.co/downloads/apps.json";

type AppEntry = {
  latest_version: string;
  version_code: number;
  download_url: string;
  sha256: string;
  notes: string;
  published_at: string;
};

type AppsManifest = {
  apps: Record<string, AppEntry>;
};

const APP_DISPLAY_NAMES: Record<string, string> = {
  "dumb-down-launcher": "Dumb Down Launcher",
  "dumb-contacts-sync": "Dumb Contacts Sync",
};

function isAndroidUA(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

function AppCard({ appKey, entry }: { appKey: string; entry: AppEntry }) {
  const displayName = APP_DISPLAY_NAMES[appKey] ?? appKey;
  const isAndroid = isAndroidUA();

  return (
    <div className={styles.card} style={{ marginBottom: 20 }}>
      <div className={styles.header}>
        <div className={styles.badge}>Android</div>
        <h2 className={styles.h1} style={{ fontSize: 22 }}>
          {displayName}
        </h2>
      </div>

      {!isAndroid && (
        <div className={styles.notice}>
          <strong>Not on Android?</strong> Open this page on your Android
          device to install.
        </div>
      )}

      <a
        href={entry.download_url}
        className={`${styles.button} ${!isAndroid ? styles.buttonDisabled : ""} ${styles.downloadButton}`}
        onClick={(e) => {
          if (!isAndroid) e.preventDefault();
        }}
      >
        Download APK &bull; v{entry.latest_version}
      </a>

      <div className={styles.metaCol}>
        {entry.notes && (
          <div className={styles.notice}>
            <div className={styles.metaTitle}>Release notes</div>
            <div>{entry.notes}</div>
          </div>
        )}

        {entry.sha256 && (
          <div className={styles.notice}>
            <div className={styles.metaTitle}>SHA-256</div>
            <div className={styles.monoBox}>{entry.sha256}</div>
          </div>
        )}

        <div className={styles.notice}>
          <div className={styles.metaTitle}>Published</div>
          <div>{new Date(entry.published_at).toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
}

export default function AppsDownload() {
  const [manifest, setManifest] = useState<AppsManifest | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(APPS_JSON_URL, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => setManifest(j as AppsManifest))
      .catch(() => setError(true));
  }, []);

  return (
    <div className={styles.page} style={{ flexDirection: "column", gap: 0 }}>
      <div style={{ width: 720, maxWidth: "100%", marginBottom: 24 }}>
        <div className={styles.badge}>Android</div>
        <h1 className={styles.h1}>Dumb Apps</h1>
        <p style={{ opacity: 0.7, margin: "4px 0 0" }}>
          Download and install directly — no app store required.
        </p>
      </div>

      {error && (
        <div
          className={styles.notice}
          style={{ width: 720, maxWidth: "100%" }}
        >
          Failed to load app listing. Try refreshing.
        </div>
      )}

      {!manifest && !error && (
        <div style={{ color: "rgba(255,255,255,0.5)" }}>Loading...</div>
      )}

      {manifest &&
        Object.entries(manifest.apps).map(([key, entry]) => (
          <AppCard key={key} appKey={key} entry={entry} />
        ))}
    </div>
  );
}
