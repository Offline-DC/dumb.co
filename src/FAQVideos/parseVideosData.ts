export type VideoItemData = {
  id: string;
  title: string;
  /** The original link from the markdown (kept for "open in new tab" fallbacks). */
  link: string;
  /** A URL safe to drop into an <iframe> so the video plays in-page. */
  embedUrl: string;
};

/**
 * Turn a YouTube / Vimeo (or already-embeddable) link into an iframe src.
 * Returns null for anything we can't safely embed.
 */
export function toEmbedUrl(rawLink: string): string | null {
  const link = rawLink.trim();
  if (!link) return null;

  // YouTube: watch?v=, youtu.be/, /embed/, or /shorts/
  const yt = link.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i,
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;

  // Vimeo: vimeo.com/12345, vimeo.com/video/12345, player.vimeo.com/video/12345
  const vimeo = link.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  // Already a player/embed URL or some other https source — embed as-is.
  if (/^https?:\/\//i.test(link)) return link;

  return null;
}

/**
 * Slugify a title into a stable-ish id when no explicit id: is provided.
 */
function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "video"
  );
}

/**
 * Parse the blank-line-delimited `title:` / `link:` blocks in videos_data.md.
 * Mirrors the press_data.md convention (lines starting with # are comments).
 */
export function parseVideosMarkdown(raw: string): VideoItemData[] {
  if (typeof raw !== "string" || raw.trim().length === 0) return [];

  const blocks = raw
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  const out: VideoItemData[] = [];
  const seen = new Set<string>();

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith("#"));

    const map: Record<string, string> = {};
    for (const line of lines) {
      const idx = line.indexOf(":");
      if (idx <= 0) continue;
      const key = line.slice(0, idx).trim().toLowerCase();
      const value = line.slice(idx + 1).trim();
      if (!key || !value) continue;
      map[key] = value;
    }

    const title = map["title"];
    const link = map["link"];
    if (!title || !link) continue;

    const embedUrl = toEmbedUrl(link);
    if (!embedUrl) continue;

    let id = map["id"] || slugify(title);
    while (seen.has(id)) id = `${id}-2`;
    seen.add(id);

    out.push({ id, title, link, embedUrl });
  }

  return out;
}
