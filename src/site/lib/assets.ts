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

const sorted = (g: Record<string, { default: ImageMetadata }>) =>
  Object.keys(g).sort().map((k) => g[k].default);

export const A = {
  logo: await webp(logo, { width: 520 }),
  noX: noX.src, noInstagram: noInstagram.src, noFacebook: noFacebook.src,
  duckDance: await webp(duckDance, { width: 200 }),
  duckWalk: duckWalk.src,
  egg: await webp(egg, { width: 180 }),
  madeInDc: await webp(madeInDc, { width: 500 }),
  polaroid: await webp(polaroid, { width: 640, quality: 85 }),
  handset: await webp(handset, { width: 1200, quality: 90 }),
  dpadCluster: await webp(dpadCluster, { width: 600 }),
  planDumb: await webp(planDumb, { width: 1500, quality: 88 }),
  planDumber: await webp(planDumber, { width: 1500, quality: 88 }),
  planDumbest: await webp(planDumbest, { width: 1500, quality: 88 }),
  signatures: await Promise.all(SIGNATURE_ORDER.map(async (n) => {
    const mod = SIGNATURES[`../assets/signatures/${n}.png`];
    return { name: n.charAt(0).toUpperCase() + n.slice(1), src: await webp(mod.default, { width: 400 }) };
  })),
  /* flipoff.exe's carousel (lifestyle) and shop.exe's gallery (studio) */
  heroes: await Promise.all(sorted(HEROES).map((m) => webp(m, { width: 1400 }))),
  shopPhotos: await Promise.all(sorted(SHOP).map((m) => webp(m, { width: 1200 }))),
};
