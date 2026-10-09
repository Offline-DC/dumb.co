/**
 * Site copy that lives in src/content/*.json, edited through Pages CMS
 * (https://app.pagescms.org, forms defined in /.pages.yml).
 *
 * The JSON is imported at build time, so an edit in the CMS is a commit to
 * main and the normal deploy workflow puts it live. Nothing is fetched at
 * runtime.
 *
 * Every value goes through a default here. A field someone blanks out, or a
 * file that loses a key, falls back to the text the site shipped with rather
 * than rendering an empty button or crashing the page.
 */
import homeJson from "./home.json";
import shopJson from "./shop.json";
import settingsJson from "./settings.json";
import pressJson from "./press.json";
import memoriesJson from "./memories.json";
import videosJson from "./faq_videos.json";
import internshipJson from "./internship.json";

/** a non-empty string from the CMS, or the fallback */
export function str(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

/** an array from the CMS, or [] */
export function list<T = Record<string, unknown>>(value: unknown): T[] {
  return Array.isArray(value)
    ? (value.filter((v) => v && typeof v === "object") as T[])
    : [];
}

/** the CMS stores booleans, but a hand-edited file might say "true" */
export function isHidden(value: unknown): boolean {
  return value === true || value === "true";
}

/** "/src/Press/images/bi.jpg" -> "bi.jpg"; the bundler resolves by filename */
export function fileName(path: unknown): string {
  return typeof path === "string" ? path.trim().split("/").pop() ?? "" : "";
}

// ------------------------------------------------------------------ settings
const s = (settingsJson ?? {}) as Record<string, unknown>;
const nf = (s.not_found ?? {}) as Record<string, unknown>;

export const SETTINGS = {
  supportEmail: str(s.support_email, "support@dumb.co"),
  supportPhone: str(s.support_phone, "404-716-3605"),
  hoursWeekdays: str(s.hours_weekdays, "8am-9pm EST Mon-Fri"),
  hoursWeekends: str(s.hours_weekends, "10am-2pm EST Sat-Sun"),
  organizeEmail: str(s.organize_email, "organize@dumb.co"),
  organizeText: str(s.organize_text, "get $ off for a\ngroup dumb down"),
  footerName: str(s.footer_name, "Dumb Co."),
  notFound: {
    heading: str(nf.heading, "404"),
    message: str(nf.message, "oops, that url is not valid :("),
    button: str(nf.button, "Go back home"),
  },
};

/** "+1 (404) 716-3605" -> "tel:+14047163605" */
export function telHref(phone: string): string {
  return "tel:" + phone.replace(/[^\d+]/g, "");
}

// ---------------------------------------------------------------------- home
const h = (homeJson ?? {}) as Record<string, unknown>;
export const HOME = {
  photoCaption: str(h.photo_caption, "make your move."),
  headingLine1: str(h.heading_line_1, "hello from"),
  headingLine2: str(h.heading_line_2, "the flip side."),
  body: str(
    h.body,
    "dumb.co was born in Washington, DC in 2025 after a small group of neighbors came together to form Month Offline: a 30-day challenge to ditch our smartphones. we learned a lot along the way, and decided to design a device that's just dumb enough. the dumbphone 2 is a companion device that syncs with ur smartphone and includes maps, music, rideshare, and all ur messages (but only if u want). our little team is stoked that ur part of the growing movement of dumb ppl choosing dumb down.",
  ),
  signOff: str(h.sign_off, "quack,"),
  button: str(h.button, "see more"),
};

// ---------------------------------------------------------------------- shop
const sh = (shopJson ?? {}) as Record<string, unknown>;
const DEFAULT_CHECKOUT = "https://buy.stripe.com/00w3cocK48f87HBakE8N20D";
export const SHOP = {
  productName: str(sh.product_name, "dumbphone 2"),
  buyButton: str(sh.buy_button, "click here 2 buy!!!"),
  // only ever an https link: a typo here would otherwise send buyers nowhere
  checkoutUrl: /^https:\/\/\S+$/i.test(str(sh.checkout_url, ""))
    ? str(sh.checkout_url, DEFAULT_CHECKOUT).trim()
    : DEFAULT_CHECKOUT,
  questionsLink: str(sh.questions_link, "questions?"),
  financialAid: str(
    sh.financial_aid,
    "for financial / student aid, email support@dumb.co",
  ),
};

// --------------------------------------------------------------------- press
const p = (pressJson ?? {}) as Record<string, unknown>;
export type PressEntry = {
  id?: string;
  title?: string;
  source?: string;
  link?: string;
  image?: string;
  hidden?: boolean | string;
};
export const PRESS = {
  heading: str(p.heading, "Press"),
  contactEmail: str(p.contact_email, "afreka@dumb.co"),
  items: list<PressEntry>(p.items),
};

// ------------------------------------------------------------------ memories
export type MemoryEntry = {
  name?: string;
  when?: string;
  where?: string;
  blurb?: string;
  hidden?: boolean | string;
  photos?: { image?: string; caption?: string }[];
};
export const MEMORIES = list<MemoryEntry>(
  (memoriesJson as Record<string, unknown>)?.events,
);

// ---------------------------------------------------------------- faq videos
export type VideoEntry = { id?: string; title?: string; link?: string };
export const FAQ_VIDEOS = list<VideoEntry>(
  (videosJson as Record<string, unknown>)?.videos,
);

// ---------------------------------------------------------------- internship
const i = (internshipJson ?? {}) as Record<string, unknown>;
export type RoleEntry = {
  label?: string;
  description?: string;
  hidden?: boolean | string;
};
export const INTERNSHIP = {
  intro: str(i.intro, ""),
  chooseLabel: str(i.choose_label, "— choose a role —"),
  emptyState: str(i.empty_state, "Pick a role to see the description."),
  roles: list<RoleEntry>(i.roles).filter(
    (r) => !isHidden(r.hidden) && str(r.label, "") && str(r.description, ""),
  ),
  conclusion: str(i.conclusion, ""),
};
