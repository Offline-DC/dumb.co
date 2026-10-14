/**
 * Content with its image URLs resolved, shared by the section components
 * (which render it into the page) and the browser script (which needs the
 * memories photos for the full-size viewer).
 */
import { MEMORY_EVENTS, PRESS_ITEMS } from "./content";
import { webp } from "./assets";

export const MEMORIES = await Promise.all(MEMORY_EVENTS.map(async (ev) => ({
  name: ev.name, when: ev.when, where: ev.where, blurb: ev.blurb, vimeoId: ev.vimeoId,
  photos: await Promise.all(ev.photos.map(async (ph) => ({
    src: await webp(ph.image, { width: 900, quality: 72 }), cap: ph.caption,
  }))),
})));

export const PRESS = await Promise.all(PRESS_ITEMS.map(async (p) => ({
  id: p.id, title: p.title, source: p.source, href: p.href,
  img: await webp(p.image, { width: 220, height: 220, fit: "cover", quality: 72 }),
})));
