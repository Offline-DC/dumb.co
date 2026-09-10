#!/usr/bin/env node
/**
 * Gives every route in scripts/routes.mjs a real file in dist/, and writes
 * sitemap.xml + robots.txt.
 *
 * WHY: the site is a single-page app on GitHub Pages. The deploy workflow fakes
 * routing with `cp dist/index.html dist/404.html`, which renders the app for any
 * path — but GitHub Pages sends it with an HTTP 404 status. Browsers ignore
 * that; crawlers don't, so today every URL except / is unindexable. Writing
 * dist/press/index.html makes /press a real file with a real 200, and lets each
 * route carry its own <title>, description, canonical and og: tags instead of
 * all thirteen sharing the homepage's.
 *
 * This is not server-side rendering: the body is still rendered by React in the
 * browser. It fixes the status code and the metadata, which is the part search
 * engines and link previews get wrong today. Full prerendering of the body
 * (React Router 7 framework mode, `ssr: false` + `prerender`) is the next step
 * and does not conflict with this.
 *
 * Runs from `npm run build`. Writes only inside dist/.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE, ROUTES } from "./routes.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const INDEX = join(DIST, "index.html");

if (!existsSync(INDEX)) {
  console.error("prerender: no dist/index.html — run vite build first");
  process.exit(1);
}

const shell = readFileSync(INDEX, "utf8");
const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** replace the content of a meta tag, whether it is on one line or several */
function setMeta(html, attr, name, content) {
  const re = new RegExp(
    `(<meta\\s+[^>]*${attr}=(?:"|')${name}(?:"|')[^>]*content=(?:"|'))[\\s\\S]*?((?:"|')[^>]*>)`,
    "i"
  );
  if (re.test(html)) return html.replace(re, `$1${esc(content)}$2`);
  const re2 = new RegExp(
    `(<meta\\s+[^>]*content=(?:"|'))[\\s\\S]*?((?:"|')[^>]*${attr}=(?:"|')${name}(?:"|')[^>]*>)`,
    "i"
  );
  if (re2.test(html)) return html.replace(re2, `$1${esc(content)}$2`);
  return html.replace("</head>", `    <meta ${attr}="${name}" content="${esc(content)}" />\n  </head>`);
}

function page({ path, title, description }) {
  const url = SITE + (path === "/" ? "/" : path);
  let h = shell;
  h = h.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
  h = setMeta(h, "name", "description", description);
  h = setMeta(h, "property", "og:title", title);
  h = setMeta(h, "property", "og:description", description);
  h = setMeta(h, "property", "og:url", url);
  h = setMeta(h, "name", "twitter:title", title);
  h = setMeta(h, "name", "twitter:description", description);
  h = setMeta(h, "name", "twitter:url", url);
  // one canonical, replacing any the shell already had
  h = h.replace(/\s*<link rel="canonical"[^>]*>/gi, "");
  h = h.replace("</head>", `    <link rel="canonical" href="${url}" />\n  </head>`);
  return h;
}

/* If a future Vite version reshapes the head, these regexes could quietly
   match nothing and we would ship thirteen copies of the homepage's metadata.
   Check the first route actually changed, and stop the build if it didn't. */
function assertRewritten(route) {
  const html = page(route);
  const problems = [];
  if (!html.includes(`<title>${esc(route.title)}</title>`)) problems.push("<title>");
  if (!html.includes(esc(route.description))) problems.push("meta description");
  if (!html.includes(`rel="canonical" href="${SITE}${route.path}"`)) problems.push("canonical");
  if (!html.includes(`content="${SITE}${route.path}"`)) problems.push("og:url");
  if (problems.length) {
    console.error(
      `prerender: could not rewrite ${problems.join(", ")} in dist/index.html.\n` +
      "  The head markup changed shape — fix the patterns in scripts/prerender.mjs\n" +
      "  rather than shipping every route with the homepage's metadata."
    );
    process.exit(1);
  }
}
assertRewritten(ROUTES.find((r) => r.path === "/press") ?? ROUTES[1]);

/* Two files per route, on purpose:
     dist/press.html          GitHub Pages serves /press from this, 200, no redirect
     dist/press/index.html    serves /press/ , and is what every other static
                              server (python -m http.server, nginx, Netlify)
                              uses for /press via a 301 to the trailing slash
   Both carry the same canonical (/press, no slash), so the two spellings can't
   read as duplicate pages. */
let written = 0;
for (const route of ROUTES) {
  const html = page(route);
  if (route.path === "/") {
    writeFileSync(INDEX, html, "utf8");
  } else {
    const slug = route.path.replace(/^\//, "");
    const dirFile = join(DIST, slug, "index.html");
    mkdirSync(dirname(dirFile), { recursive: true });
    writeFileSync(dirFile, html, "utf8");
    const flatFile = join(DIST, `${slug}.html`);
    mkdirSync(dirname(flatFile), { recursive: true });
    writeFileSync(flatFile, html, "utf8");
  }
  written++;
}

// 404.html keeps unknown paths rendering the app (with a 404, which is correct
// for a URL that really does not exist) — built from the homepage metadata.
writeFileSync(join(DIST, "404.html"), page(ROUTES[0]), "utf8");

const today = new Date().toISOString().slice(0, 10);
const urls = ROUTES.filter((r) => r.sitemap !== false)
  .map((r) => `  <url>\n    <loc>${SITE}${r.path === "/" ? "/" : r.path}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
  .join("\n");
writeFileSync(
  join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  "utf8"
);

writeFileSync(
  join(DIST, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`,
  "utf8"
);

console.log(`prerender: ${written} routes (as <slug>.html and <slug>/index.html)`
            + ` + sitemap.xml + robots.txt + 404.html`);
