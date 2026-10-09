import type { PressItemData } from "./PressItem";
import { PRESS, fileName, isHidden, str, type PressEntry } from "../content";

/**
 * Press items come from src/content/press.json, which is what the Press
 * section of Pages CMS edits. Images are uploaded through the CMS into
 * src/Press/images and stored in the JSON as "/src/Press/images/<file>"; they
 * are matched here by filename so Vite still bundles and hashes them.
 */
const IMAGE_MODULES = import.meta.glob("./images/*", {
  eager: true,
  import: "default",
}) as Record<string, string>;

function getImageUrlByName(imageName: string): string | null {
  const base = fileName(imageName);
  if (!base) return null;
  const key = `./images/${base}`;
  if (IMAGE_MODULES[key]) return IMAGE_MODULES[key];
  // filenames are case-sensitive on the build server but not on a Mac
  const lower = base.toLowerCase();
  const foundKey = Object.keys(IMAGE_MODULES).find(
    (k) => k.split("/").pop()!.toLowerCase() === lower,
  );
  return foundKey ? IMAGE_MODULES[foundKey] : null;
}

function slugify(text: string): string {
  return (
    text
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "PRESS"
  );
}

function normalizeHref(raw: string): string | null {
  const href = raw.trim();
  if (!href) return null;
  if (/^https?:\/\//i.test(href) || href.startsWith("#")) return href;
  if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(href)) return `https://${href}`;
  return null;
}

/**
 * Turn the CMS entries into what the list renders. An entry that is hidden,
 * has no title or link, or points at an image that isn't in src/Press/images
 * is skipped rather than shown broken.
 */
export function buildPressItems(entries: PressEntry[]): PressItemData[] {
  const out: PressItemData[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    if (isHidden(entry.hidden)) continue;
    const title = str(entry.title, "");
    const href = normalizeHref(str(entry.link, ""));
    const image = getImageUrlByName(str(entry.image, ""));
    if (!title || !href || !image) {
      if (import.meta.env.DEV) {
        console.warn("[press] skipped an entry:", entry);
      }
      continue;
    }

    let id = str(entry.id, "") || slugify(title);
    while (seen.has(id)) id = `${id}-2`;
    seen.add(id);

    const source = str(entry.source, "");
    out.push({ id, title, href, image, ...(source ? { source } : {}) });
  }

  return out;
}

export const PRESS_ITEMS: PressItemData[] = buildPressItems(PRESS.items);

export function openPressItemAtRow(row: number) {
  const item = PRESS_ITEMS[row];
  if (!item?.href) return;
  window.open(item.href, "_blank", "noopener,noreferrer");
}
