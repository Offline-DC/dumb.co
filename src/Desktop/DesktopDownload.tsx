// DesktopDownload.tsx — /desktop
// Download page for the "Dumb Down — Google Messages sign-in" desktop helper.
// Mirrors AppsDownload.tsx: reads the latest GitHub Release and offers
// Mac/Windows installers. Installers live as Release assets (too big for the
// gh-pages repo).
import { useEffect, useState } from "react";
import styles from "../Android/index.module.css";

// The repo whose GitHub Releases host the desktop installers. The CI workflow
// (.github/workflows/desktop.yml) builds + uploads them here via tauri-action.
const DESKTOP_REPO = "Offline-DC/dumb.co";

type Os = "mac" | "windows" | "other";

function detectOs(): Os {
  if (typeof navigator === "undefined") return "other";
  const p = `${navigator.platform} ${navigator.userAgent}`.toLowerCase();
  if (p.includes("mac")) return "mac";
  if (p.includes("win")) return "windows";
  return "other";
}

type Release = {
  versionName: string;
  publishedAt: string;
  macUrl: string | null;
  winUrl: string | null;
};

async function fetchRelease(): Promise<Release | null> {
  try {
    const r = await fetch(
      `https://api.github.com/repos/${DESKTOP_REPO}/releases/latest`,
      { headers: { Accept: "application/vnd.github+json" } }
    );
    if (!r.ok) return null;
    const json = await r.json();
    const assets: { name: string; browser_download_url: string }[] =
      json.assets ?? [];
    // Match by extension — tauri-action names assets with productName+version,
    // so we don't hard-code exact filenames.
    const bySuffix = (suffix: string) =>
      assets.find((a) => a.name.toLowerCase().endsWith(suffix))
        ?.browser_download_url ?? null;
    return {
      versionName: (json.tag_name ?? "").replace(/^(v|desktop-v?)/, ""),
      publishedAt: json.published_at ?? "",
      macUrl: bySuffix(".dmg"),
      winUrl: bySuffix(".exe"),
    };
  } catch {
    return null;
  }
}

export default function DesktopDownload() {
  const [release, setRelease] = useState<Release | null | "loading">("loading");
  const os = detectOs();

  useEffect(() => {
    fetchRelease().then(setRelease);
  }, []);

  const primaryOs: Exclude<Os, "other"> = os === "windows" ? "windows" : "mac";

  return (
    <div className={styles.page} style={{ flexDirection: "column", gap: 0 }}>
      <div style={{ width: 720, maxWidth: "100%", marginBottom: 24 }}>
        <div className={styles.badge}>Desktop</div>
        <h1 className={styles.h1}>Sign in from your computer</h1>
      </div>

      <div className={styles.card} style={{ marginBottom: 20 }}>
        <div className={styles.header}>
          <div className={styles.badge}>
            {primaryOs === "windows" ? "Windows" : "macOS"}
          </div>
          <h2 className={styles.h1} style={{ fontSize: 22 }}>
            Dumb Down — Google sign-in
          </h2>
        </div>

        {release === "loading" && (
          <div style={{ opacity: 0.5, marginTop: 12 }}>Loading…</div>
        )}

        {release === null && (
          <div className={styles.notice} style={{ marginTop: 12 }}>
            No release available yet — check back soon.
          </div>
        )}

        {release && release !== "loading" && (
          <>
            <DownloadButton
              label={`Download for Mac${
                release.versionName ? ` • v${release.versionName}` : ""
              }`}
              url={release.macUrl}
              highlight={primaryOs === "mac"}
            />
            <DownloadButton
              label={`Download for Windows${
                release.versionName ? ` • v${release.versionName}` : ""
              }`}
              url={release.winUrl}
              highlight={primaryOs === "windows"}
            />

            {release.publishedAt && (
              <div className={styles.metaCol}>
                <div className={styles.notice}>
                  <div className={styles.metaTitle}>Published</div>
                  <div>
                    {new Date(release.publishedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ width: 720, maxWidth: "100%", opacity: 0.75, fontSize: 14, lineHeight: 1.6 }}>
        <strong>How it works:</strong> open the app, sign into Google, and it
        shows a QR code. Nothing is stored on our servers.
      </div>
    </div>
  );
}

function DownloadButton({
  label,
  url,
  highlight,
}: {
  label: string;
  url: string | null;
  highlight: boolean;
}) {
  const disabled = !url;
  return (
    <a
      href={url ?? "#"}
      className={`${styles.button} ${disabled ? styles.buttonDisabled : ""} ${
        styles.downloadButton
      }`}
      style={highlight ? undefined : { opacity: 0.85 }}
      onClick={(e) => {
        if (disabled) e.preventDefault();
      }}
    >
      {label}
      {disabled ? " (coming soon)" : ""}
    </a>
  );
}
