export type VideoItemData = {
  id: string;
  title: string;
  /** The original link (kept for "open in new tab" fallbacks). */
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
 * The videos come from src/content/faq_videos.json (Pages CMS: "FAQ videos").
 * Anything without a title, or with a link we can't embed, is skipped.
 */
export function buildVideoItems(
  entries: { id?: string; title?: string; link?: string }[],
): VideoItemData[] {
  const out: VideoItemData[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    const title = typeof entry.title === "string" ? entry.title.trim() : "";
    const link = typeof entry.link === "string" ? entry.link.trim() : "";
    if (!title || !link) continue;

    const embedUrl = toEmbedUrl(link);
    if (!embedUrl) continue;

    let id = (typeof entry.id === "string" && entry.id.trim()) || slugify(title);
    while (seen.has(id)) id = `${id}-2`;
    seen.add(id);

    out.push({ id, title, link, embedUrl });
  }

  return out;
}
