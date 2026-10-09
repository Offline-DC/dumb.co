/**
 * The site's editable content: src/content/*.json, which Pages CMS edits
 * (forms in /.pages.yml). Read once at build time; nothing here runs in a
 * visitor's browser.
 *
 * Nothing in here should make a build fail over content. Someone editing in
 * the CMS can't see a build log, and a failed build means their edit silently
 * never appears. So:
 *   - a field that is missing or the wrong type falls back to the shipped
 *     value in DEFAULTS (for the few the page can't do without) or to empty
 *     (everything else just doesn't render);
 *   - a press item or memory photo whose image file isn't there is skipped,
 *     with a warning in the build output;
 *   - the checkout link is only ever an https URL, or the default.
 */
import type { ImageMetadata } from "astro";
import homeJson from "../../content/home.json";
import aboutJson from "../../content/about.json";
import shopJson from "../../content/shop.json";
import communityJson from "../../content/community.json";
import settingsJson from "../../content/settings.json";
import pressJson from "../../content/press.json";
import memoriesJson from "../../content/memories.json";
import faqJson from "../../content/faq.json";

type Obj = Record<string, unknown>;

const DEFAULTS: Record<string, string> = {
  "shop.checkout_url": "https://buy.stripe.com/00w3cocK48f87HBakE8N20D",
  "shop.buy_button": "click here to buy",
  "shop.product_name": "dumbphone 2",
  "settings.support_email": "support@dumb.co",
  "settings.site_description":
    "Buy the \"world's best dumb phone\" for only $20. The dumbphone 2 syncs w/ ur smartphone --contacts, messages, Rideshare, Maps.",
  "settings.share_title": "dumb.co - Dumbphone 2",
  "press.heading": "Press",
  "memories.heading": "Memories",
  "home.button": "shop dumbphone 2 →",
  "faq.heading": "FAQ",
  "faq.general_tab": "General",
  "faq.tech_tab": "Tech Help",
  "faq.videos_tab": "Phone Demo",
};

export const warnings: string[] = [];

const obj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});

function text(d: Obj, key: string, file?: string): string {
  let v = d[key];
  if (typeof v === "number") v = String(v);
  if (typeof v === "string" && v.trim()) return v.trim();
  return file ? DEFAULTS[`${file}.${key}`] ?? "" : "";
}
const items = (d: Obj, key: string): unknown[] =>
  Array.isArray(d[key]) ? (d[key] as unknown[]).filter((x) => x != null) : [];
const objs = (d: Obj, key: string): Obj[] =>
  items(d, key).filter((x) => x && typeof x === "object").map((x) => x as Obj);
const strings = (d: Obj, key: string): string[] =>
  items(d, key).map((x) => String(x).trim()).filter(Boolean);
const hidden = (x: Obj) => x.hidden === true || x.hidden === "true";

export function link(v: string): string {
  v = (v || "").trim();
  if (/^(https?:\/\/|mailto:|tel:)\S+$/i.test(v)) return v;
  if (/^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(v)) return "https://" + v;
  return "";
}
export function vimeoId(v: string): string | null {
  const m = (v || "").trim().match(/(?:vimeo\.com\/(?:video\/)?)?(\d{5,})/);
  return m ? m[1] : null;
}

/* ---- images uploaded through the CMS, matched by file name ---------------
   The CMS stores the path it uploaded to ("/src/Press/images/bi.jpg"); a
   hand-edited file might give just the name. Matched ignoring case: a Mac
   doesn't care about case, the Linux build server does. */
const PRESS_IMAGES = import.meta.glob<{ default: ImageMetadata | string }>(
  "/src/Press/images/*.{jpg,jpeg,png,webp,avif,gif,svg,JPG,JPEG,PNG,WEBP,AVIF}",
  { eager: true },
);
const MEMORY_IMAGES = import.meta.glob<{ default: ImageMetadata }>(
  "/src/site/assets/memories/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}",
  { eager: true },
);
function findImage<T>(path: unknown, table: Record<string, { default: T }>): T | null {
  if (typeof path !== "string" || !path.trim()) return null;
  const want = path.trim().split("/").pop()!.toLowerCase();
  for (const [k, mod] of Object.entries(table)) {
    if (k.split("/").pop()!.toLowerCase() === want) return mod.default;
  }
  return null;
}

/* ------------------------------------------------------------------ copy */
const home = obj(homeJson), about = obj(aboutJson), shop = obj(shopJson);
const community = obj(communityJson), settings = obj(settingsJson);
const press = obj(pressJson), memories = obj(memoriesJson), faq = obj(faqJson);

const pick = (d: Obj, file: string, keys: string[]) =>
  Object.fromEntries(keys.map((k) => [k, text(d, k, file)])) as Record<string, string>;

const checkout = text(shop, "checkout_url");

export const COPY = {
  site: pick(settings, "settings", ["site_description", "share_title", "share_image_alt"]),
  /* each page's <title> and description, for Google and link previews */
  pages: Object.fromEntries(
    ["home", "shop", "about", "community", "press", "memories", "faq", "contact"].map((k) => {
      const pg = obj(obj(settings.pages)[k]);
      return [k, {
        title: text(pg, "title") || (k === "home" ? "dumb.co" : `${k} - dumb.co`),
        description: text(pg, "description") || text(settings, "site_description", "settings"),
      }];
    }),
  ) as Record<string, { title: string; description: string }>,
  home: pick(home, "home", ["kicker", "headline", "body", "button"]),
  about: pick(about, "about", ["heading", "body", "sign_off"]),
  shop: {
    ...pick(shop, "shop", [
      "product_name", "buy_button", "price", "plan_line", "quiz_link",
      "what_is_title", "what_is", "included_title", "essentials_title",
      "specs_title", "specs_intro", "plans_title", "plans_sub", "plans_note",
      "quiz_button", "reviews_heading", "end_heading", "end_line",
    ]),
    checkout_url: /^https:\/\/\S+$/.test(checkout) ? checkout : DEFAULTS["shop.checkout_url"],
    hero_lines: strings(shop, "hero_lines"),
    highlights: strings(shop, "highlights"),
    included: strings(shop, "included"),
    essentials: strings(shop, "essentials"),
    specs: objs(shop, "specs")
      .map((x) => ({ label: text(x, "label"), value: text(x, "value") }))
      .filter((x) => x.label),
  },
  community: {
    ...pick(community, "community", ["heading", "lede", "footer_text", "footer_email"]),
    programs: objs(community, "programs")
      .filter((x) => !hidden(x) && text(x, "name"))
      .map((x) => ({
        kicker: text(x, "kicker"),
        name: text(x, "name"),
        body: text(x, "body"),
        link_label: text(x, "link_label"),
        link_url: link(text(x, "link_url")),
      })),
  },
  contact: {
    ...pick(settings, "settings", [
      "support_email", "support_phone", "contact_heading", "support_heading",
      "support_tagline", "social_line",
    ]),
    hours: objs(settings, "hours")
      .map((x) => ({ days: text(x, "days"), hours: text(x, "hours") }))
      .filter((x) => x.days || x.hours),
  },
  press: pick(press, "press", ["heading", "contact_email"]),
  memories: { heading: text(memories, "heading", "memories") },
  faq: {
    ...pick(faq, "faq", ["heading", "sub", "general_tab", "tech_tab", "videos_tab"]),
    questions: objs(faq, "questions")
      .filter((x) => !hidden(x) && text(x, "question") && text(x, "answer"))
      .map((x) => ({
        question: text(x, "question"),
        answer: text(x, "answer"),
        category: text(x, "category").toLowerCase() === "tech" ? "tech" : "general",
      })),
    videos: objs(faq, "videos")
      .map((x) => ({ title: text(x, "title"), vimeoId: vimeoId(text(x, "link")) }))
      .filter((x): x is { title: string; vimeoId: string } => !!(x.title && x.vimeoId)),
  },
};

/* ----------------------------------------------------------------- press */
export type PressItem = {
  id: string; title: string; source: string; href: string;
  image: ImageMetadata | string;
};
export const PRESS_ITEMS: PressItem[] = (() => {
  const out: PressItem[] = [];
  const seen = new Set<string>();
  for (const x of objs(press, "items")) {
    if (hidden(x)) continue;
    const title = text(x, "title"), href = link(text(x, "link"));
    const image = findImage(x.image, PRESS_IMAGES);
    if (!title || !href || !image) {
      warnings.push(`press: skipped ${title || JSON.stringify(x)} (${
        !title ? "no title" : !href ? "no usable link" : `image not found: ${x.image}`})`);
      continue;
    }
    let id = text(x, "id") || title.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");
    while (seen.has(id)) id += "-2";
    seen.add(id);
    out.push({ id, title, source: text(x, "source"), href, image });
  }
  return out;
})();

/* -------------------------------------------------------------- memories */
export type MemoryEvent = {
  name: string; when: string; where: string; blurb: string; vimeoId: string | null;
  photos: { image: ImageMetadata; caption: string }[];
};
export const MEMORY_EVENTS: MemoryEvent[] = objs(memories, "events")
  .filter((x) => !hidden(x) && text(x, "name"))
  .map((x) => ({
    name: text(x, "name"),
    when: text(x, "when"),
    where: text(x, "where"),
    blurb: text(x, "blurb"),
    vimeoId: vimeoId(text(x, "video")),
    photos: objs(x, "photos").flatMap((ph) => {
      const image = findImage(ph.image, MEMORY_IMAGES);
      if (!image) {
        warnings.push(`memories: ${text(x, "name")}: photo not found: ${ph.image}`);
        return [];
      }
      return [{ image, caption: text(ph, "caption") }];
    }),
  }));

if (warnings.length && typeof process !== "undefined" && !(globalThis as Obj).__contentWarned) {
  (globalThis as Obj).__contentWarned = true;
  console.warn("\n  content (src/content/*.json):\n" + warnings.map((w) => "    " + w).join("\n") + "\n");
}
