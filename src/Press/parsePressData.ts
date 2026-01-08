import type { PressItemData } from "./PressItem";

const IMAGE_MODULES = import.meta.glob("./images/*", {
  eager: true,
  import: "default",
}) as Record<string, string>;

function getImageUrlByName(imageName: string): string | null {
  if (!imageName) return null;

  const normalized = imageName.trim();
  if (!normalized) return null;

  const key = `./images/${normalized}`;
  if (IMAGE_MODULES[key]) return IMAGE_MODULES[key];

  const base = normalized.split("/").pop()!;
  const foundKey = Object.keys(IMAGE_MODULES).find((k) =>
    k.endsWith(`/${base}`)
  );
  return foundKey ? IMAGE_MODULES[foundKey] : null;
}

export function parsePressMarkdown(raw: string): PressItemData[] {
  if (typeof raw !== "string" || raw.trim().length === 0) return [];

  const blocks = raw
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  const out: PressItemData[] = [];

  for (const block of blocks) {
    try {
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

      const id = map["id"];
      const title = map["title"];
      const hrefRaw = map["href"];
      const imageName = map["image_name"];
      const source = map["source"]; // optional

      if (!id || !title || !hrefRaw || !imageName) continue;

      const imageUrl = getImageUrlByName(imageName);
      if (!imageUrl) continue; // skip if image can't be resolved

      const href =
        /^https?:\/\//i.test(hrefRaw) || hrefRaw.startsWith("#")
          ? hrefRaw
          : `https://${hrefRaw}`;

      out.push({
        id,
        title,
        href,
        image: imageUrl,
        ...(source ? { source } : {}),
      });
    } catch {
      continue;
    }
  }

  return out;
}

export function openPressItemAtRow(row: number, rawPressData: string) {
  const items = parsePressMarkdown(rawPressData);
  const item = items[row];
  if (!item?.href) return;

  const href = item.href.trim();
  if (!href) return;

  // Allow # links, http(s), or bare domains like "example.com"
  const isHttp = /^https?:\/\//i.test(href);
  const isHash = href.startsWith("#");
  const isBareDomain = /^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(href);

  if (!isHttp && !isHash && !isBareDomain) return;

  const url = isHttp || isHash ? href : `https://${href}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
