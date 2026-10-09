import { MEMORIES, fileName, isHidden, str } from "../content";

/**
 * The events we've actually done, newest first. Row order is display order.
 * They are edited in Pages CMS ("Memories") and stored in
 * src/content/memories.json.
 *
 * Photos are uploaded into src/Memories/images and resolved by filename
 * through the same import.meta.glob pattern src/Press/parsePressData.ts uses,
 * so Vite hashes and fingerprints them like every other bundled asset.
 *
 * An event with no photos renders "photos coming soon" — that's how baird sits
 * until Afreka's images land.
 */
const IMAGE_MODULES = import.meta.glob("./images/*", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export function memoryImage(name: string): string | null {
  if (!name?.trim()) return null;
  const key = `./images/${name.trim()}`;
  if (IMAGE_MODULES[key]) return IMAGE_MODULES[key];
  const base = name.trim().split("/").pop()!;
  const found = Object.keys(IMAGE_MODULES).find((k) => k.endsWith(`/${base}`));
  return found ? IMAGE_MODULES[found] : null;
}

export type MemoryPhoto = {
  /** filename inside src/Memories/images */
  file: string;
  caption: string;
};

export type MemoryEvent = {
  name: string;
  when: string;
  where: string;
  blurb: string;
  photos: MemoryPhoto[];
};

export const MEMORY_EVENTS: MemoryEvent[] = MEMORIES.filter(
  (e) => !isHidden(e.hidden) && str(e.name, ""),
).map((e) => ({
  name: str(e.name, ""),
  when: str(e.when, ""),
  where: str(e.where, ""),
  blurb: str(e.blurb, ""),
  photos: (Array.isArray(e.photos) ? e.photos : [])
    .map((ph) => ({ file: fileName(ph?.image), caption: str(ph?.caption, "") }))
    // a photo whose file isn't in src/Memories/images would render broken
    .filter((ph) => ph.file && memoryImage(ph.file)),
}));
