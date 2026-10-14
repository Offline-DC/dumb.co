// @ts-check
/**
 * dumb.co -- built by Astro into plain HTML, one file per page.
 *
 *   npm run dev        local server with hot reload
 *   npm run build      dist/, what GitHub Pages serves
 *
 * SITE_BASE is only for the preview, which lives under a sub-path:
 *   SITE_BASE=/dumb.co-redesign-preview/ npm run build
 *
 * build.format "file" writes /shop as shop.html, which GitHub Pages serves at
 * /shop with a 200 -- no redirect to /shop/, no 404 fallback.
 */
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { LEGACY_ROUTES } from "./src/legacy/routes.ts";

const base = process.env.SITE_BASE || "/";
const hidden = new Set(LEGACY_ROUTES.filter((r) => r.sitemap === false).map((r) => r.path));

export default defineConfig({
  site: process.env.SITE_URL || "https://dumb.co",
  base,
  output: "static",
  trailingSlash: "never",
  build: { format: "file", inlineStylesheets: "always" },
  redirects: {
    // addresses the old site answered that now live elsewhere
    // targets carry the base, or on the preview they'd point at the domain root
    "/faqs": `${base}faq`,
    // ("/faq/videos" -> /faq is in 404.astro: as a file here it would make a
    // faq/ folder, and GitHub Pages answers /faq with that folder, not faq.html)
    "/phone": `${base}shop`,
  },
  integrations: [
    react({ include: ["**/legacy/**", "**/*.tsx"] }),
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname.replace(base, "").replace(/^\/|\.html$/g, "");
        return !hidden.has(path) && !["faqs", "phone", "404"].includes(path);
      },
    }),
  ],
  vite: {
    resolve: {
      alias: { "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs" },
    },
  },
});
