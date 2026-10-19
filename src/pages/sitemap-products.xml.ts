/**
 * dumb.co/sitemap-products.xml -- the product pages and their photos, on
 * their own so product coverage is easy to watch in Search Console. Listed
 * in sitemap-index.xml next to the page sitemap (astro.config.mjs,
 * customSitemaps). Today that is the one product page, /shop.
 */
import type { APIRoute } from "astro";
import { A } from "../site/lib/assets";
import { COPY } from "../site/lib/content";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  const root = new URL(base, site ?? "https://dumb.co");
  const products = [
    { loc: new URL("shop", root).href, images: A.shopPhotos, title: COPY.shop.product_name },
  ];
  const body = products.map((p) => [
    "<url>",
    `<loc>${esc(p.loc)}</loc>`,
    ...p.images.map((src) => `<image:image><image:loc>${esc(new URL(src, root).href)}</image:loc></image:image>`),
    "</url>",
  ].join("")).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>`
    + `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`
    + body + `</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
