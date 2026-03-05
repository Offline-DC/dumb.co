// AppsDownload.tsx
import { useEffect, useState } from "react";
import styles from "./index.module.css";

type AppSpec = {
  repo: string;
  displayName: string;
  apkName: string;
};

const APPS: AppSpec[] = [
  {
    repo: "Offline-DC/dumb-down-launcher",
    displayName: "Dumb Down Launcher",
    apkName: "dumb-down-launcher.apk",
  },
  {
    repo: "Offline-DC/dumb-contacts-sync-android",
    displayName: "Dumb Contacts Sync",
    apkName: "dumb-contacts-sync.apk",
  },
];

type ReleaseInfo = {
  versionName: string;
  downloadUrl: string;
  publishedAt: string;
};

function isAndroidUA(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

async function fetchRelease(repo: string, apkName: string): Promise<ReleaseInfo | null> {
  try {
    const r = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!r.ok) return null;
    const json = await r.json();
    const tagName: string = json.tag_name ?? "";
    const versionName = tagName.replace(/^v/, "");
    const asset = json.assets?.find((a: { name: string }) => a.name === apkName);
    if (!asset) return null;
    return {
      versionName,
      downloadUrl: asset.browser_download_url,
      publishedAt: json.published_at ?? "",
    };
  } catch {
    return null;
  }
}

function AppCard({ spec }: { spec: AppSpec }) {
  const [release, setRelease] = useState<ReleaseInfo | null | "loading">("loading");
  const isAndroid = isAndroidUA();

  useEffect(() => {
    fetchRelease(spec.repo, spec.apkName).then(setRelease);
  }, [spec.repo, spec.apkName]);

  return (
    <div className={styles.card} style={{ marginBottom: 20 }}>
      <div className={styles.header}>
        <div className={styles.badge}>Android</div>
        <h2 className={styles.h1} style={{ fontSize: 22 }}>
          {spec.displayName}
        </h2>
      </div>

      {!isAndroid && (
        <div className={styles.notice}>
          <strong>Not on Android?</strong> Open this page on your Android
          device to install.
        </div>
      )}

      {release === "loading" && (
        <div style={{ opacity: 0.5, marginTop: 12 }}>Loading...</div>
      )}

      {release === null && (
        <div className={styles.notice} style={{ marginTop: 12 }}>
          Could not load release info.
        </div>
      )}

      {release && release !== "loading" && (
        <>
          <a
            href={release.downloadUrl}
            className={`${styles.button} ${!isAndroid ? styles.buttonDisabled : ""} ${styles.downloadButton}`}
            onClick={(e) => { if (!isAndroid) e.preventDefault(); }}
          >
            Download APK &bull; v{release.versionName}
          </a>

          <div className={styles.metaCol}>
            <div className={styles.notice}>
              <div className={styles.metaTitle}>Published</div>
              <div>{new Date(release.publishedAt).toLocaleDateString()}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AppsDownload() {
  return (
    <div className={styles.page} style={{ flexDirection: "column", gap: 0 }}>
      <div style={{ width: 720, maxWidth: "100%", marginBottom: 24 }}>
        <div className={styles.badge}>Android</div>
        <h1 className={styles.h1}>Dumb Apps</h1>
        <p style={{ opacity: 0.7, margin: "4px 0 0" }}>
          Download and install directly — no app store required.
        </p>
      </div>

      {APPS.map((spec) => (
        <AppCard key={spec.repo} spec={spec} />
      ))}
    </div>
  );
}
