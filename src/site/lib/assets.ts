/**
 * Every image the site uses, optimised at build time by astro:assets (sharp):
 * resized to what is actually shown, WebP, content-hashed into /_astro/ so
 * GitHub Pages can cache them for good. Components render plain <img> tags
 * from these URLs, so the layout stays exactly what the stylesheet says.
 */
import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";

import logo from "../assets/brand/logo.webp";
import noX from "../assets/brand/no-x.svg";
import noInstagram from "../assets/brand/no-instagram.svg";
import noFacebook from "../assets/brand/no-facebook.svg";
import duckDance from "../assets/brand/duck-dance.png";
import duckWalk from "../assets/brand/duck-walk.gif";
import egg from "../assets/brand/egg.png";
import madeInDc from "../assets/brand/made-in-dc.png";
import polaroid from "../assets/brand/polaroid.png";
import handset from "../assets/phone/handset.png";
import dpadCluster from "../assets/phone/dpad-cluster.png";
import planDumb from "../assets/plans/dumb.png";
import planDumber from "../assets/plans/dumber.png";
import planDumbest from "../assets/plans/dumbest.png";

const HEROES = import.meta.glob<{ default: ImageMetadata }>("../assets/photos/hero-*.jpg", { eager: true });
const SHOP = import.meta.glob<{ default: ImageMetadata }>("../assets/photos/shop-*.jpg", { eager: true });
const SIGNATURES = import.meta.glob<{ default: ImageMetadata }>("../assets/signatures/*.png", { eager: true });

/* the order the about page has always shown them in */
const SIGNATURE_ORDER = ["lydia", "theo", "jack", "milk", "marco", "danny", "aaron", "afreka", "josh"];

type Opts = { width?: number; height?: number; quality?: number; fit?: "cover" | "contain" };

/** an optimised WebP URL, never wider than the original */
export async function webp(src: ImageMetadata | string, o: Opts = {}): Promise<string> {
  if (typeof src === "string") return src;
  if (src.format === "svg" || src.format === "gif") return src.src;   // vector / animated: as they are
  const width = o.width ? Math.min(o.width, src.width) : undefined;
  const img = await getImage({
    src, format: "webp", quality: o.quality ?? 80,
    ...(width ? { width } : {}),
    ...(o.height ? { height: o.height, fit: o.fit ?? "cover" } : {}),
  });
  return img.src;
}

/** the same image at several widths, for <img srcset>: the browser picks
    the smallest that is still sharp at the size the stylesheet draws it */
export async function webpSet(src: ImageMetadata, widths: number[], o: Opts = {}): Promise<{ src: string; srcset: string }> {
  const ws = [...new Set(widths.map((w) => Math.min(w, src.width)))].sort((a, b) => a - b);
  const urls = await Promise.all(ws.map((w) => webp(src, { ...o, width: w })));
  return { src: urls[urls.length - 1], srcset: urls.map((u, i) => `${u} ${ws[i]}w`).join(", ") };
}

/** width/height attributes for an image drawn from webp(src, { width }),
    so the browser can reserve its box before the file arrives */
const dims = (src: ImageMetadata, width: number) => {
  const w = Math.min(width, src.width);
  return { width: w, height: Math.round((src.height * w) / src.width) };
};

const sorted = (g: Record<string, { default: ImageMetadata }>) =>
  Object.keys(g).sort().map((k) => g[k].default);

export const A = {
  logo: await webp(logo, { width: 520 }),
  logoSize: dims(logo, 520),
  noX: noX.src, noInstagram: noInstagram.src, noFacebook: noFacebook.src,
  duckDance: await webp(duckDance, { width: 200 }),
  duckDanceSize: dims(duckDance, 200),
  duckWalk: duckWalk.src,
  egg: await webp(egg, { width: 180 }),
  madeInDc: await webp(madeInDc, { width: 500 }),
  polaroid: await webp(polaroid, { width: 640, quality: 85 }),
  polaroidSet: await webpSet(polaroid, [360, 640], { quality: 85 }),
  handset: await webp(handset, { width: 1200, quality: 90 }),
  /* the handset draws 218px wide on a laptop and roughly the screen's width
     on a phone (--mpw in Site.astro), so a phone at 2x gets ~800w, not the
     1200x3600 master (Lighthouse, Oct 28 audit) */
  handsetSet: await webpSet(handset, [400, 600, 800, 1000, 1200], { quality: 90 }),
  dpadCluster: await webp(dpadCluster, { width: 600 }),
  planDumb: await webp(planDumb, { width: 1500, quality: 88 }),
  planDumber: await webp(planDumber, { width: 1500, quality: 88 }),
  planDumbest: await webp(planDumbest, { width: 1500, quality: 88 }),
  /* the plan cards draw about 630px wide on a laptop, 310px on a phone */
  planSets: {
    dumb: await webpSet(planDumb, [400, 700, 1000, 1500], { quality: 88 }),
    dumber: await webpSet(planDumber, [400, 700, 1000, 1500], { quality: 88 }),
    dumbest: await webpSet(planDumbest, [400, 700, 1000, 1500], { quality: 88 }),
  },
  signatures: await Promise.all(SIGNATURE_ORDER.map(async (n) => {
    const mod = SIGNATURES[`../assets/signatures/${n}.png`];
    const set = await webpSet(mod.default, [200, 400]);
    return { name: n.charAt(0).toUpperCase() + n.slice(1), src: set.src, srcset: set.srcset };
  })),
  /* flipoff.exe's carousel (lifestyle) and shop.exe's gallery (studio) */
  /* quality 70, not the default 80: hero-01 is a grainy denim shot and at 80
     it was 348 KiB, the heaviest thing on the homepage (Oct 28 audit). 70 is
     visually the same at the size the window draws it */
  heroes: await Promise.all(sorted(HEROES).map((m) => webp(m, { width: 1400, quality: 70 }))),
  shopPhotos: await Promise.all(sorted(SHOP).map((m) => webp(m, { width: 1200 }))),
};
