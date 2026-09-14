/**
 * The events we've actually done, newest first. Row order here is display order.
 *
 * Photos live in src/Memories/images and are resolved by filename through the
 * same import.meta.glob pattern src/Press/parsePressData.ts uses, so Vite
 * hashes and fingerprints them like every other bundled asset.
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

export const MEMORY_EVENTS: MemoryEvent[] = [
  {
    name: "baird x dumb.co",
    when: "coming soon",
    where: "",
    blurb: "",
    photos: [],
  },
  {
    name: "Month Offline gallery",
    when: "August 2026",
    where: "New York, NY",
    blurb:
      "the Month Offline gallery show — a room full of what people made once they put the smartphone down. prints, zines, cyanotypes, a landline you could actually call.",
    photos: [
      { file: "mo-1.jpg", caption: "opening night" },
      { file: "mo-2.jpg", caption: "the wall of entries" },
      { file: "mo-3.jpg", caption: "prints + plants" },
      { file: "mo-4.jpg", caption: "LOST? CALL 207-806-0033" },
      { file: "mo-5.jpg", caption: "on the decks" },
    ],
  },
  {
    name: "DC Pride",
    when: "June 2026",
    where: "Washington, DC",
    blurb:
      "join the flip side. we marched the parade with the banner, the totes and a lot of bubbles.",
    photos: [
      { file: "pride-1.jpg", caption: "join the flip side" },
      { file: "pride-2.jpg", caption: "the tote" },
      { file: "pride-3.jpg", caption: "down the parade route" },
      { file: "pride-4.jpg", caption: "bubbles" },
      { file: "pride-5.jpg", caption: "dumb.co fans" },
      { file: "pride-6.jpg", caption: "parade weather" },
    ],
  },
];
