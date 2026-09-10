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

/**
 * Replace the content of a meta tag, whether it is on one line or several.
 *
 * Every replacement goes through a FUNCTION, never a template string. In a
 * string replacement JavaScript treats $1, $2, $& as capture references — and
 * this copy contains "$20" and "$15.99/mo", so a string replacement expanded
 * $2 into the captured opening tag, broke out of the <meta> element and spilled
 * `" />` and prose into the body. A replacer function passes the text through
 * verbatim. Do not turn these back into template strings.
 */
function setMeta(html, attr, name, content) {
  const value = esc(content);
  const re = new RegExp(
    `(<meta\\s+[^>]*${attr}=(?:"|')${name}(?:"|')[^>]*content=(?:"|'))[\\s\\S]*?((?:"|')[^>]*>)`,
    "i"
  );
  if (re.test(html)) return html.replace(re, (_m, open, close) => open + value + close);
  const re2 = new RegExp(
    `(<meta\\s+[^>]*content=(?:"|'))[\\s\\S]*?((?:"|')[^>]*${attr}=(?:"|')${name}(?:"|')[^>]*>)`,
    "i"
  );
  if (re2.test(html)) return html.replace(re2, (_m, open, close) => open + value + close);
  return html.replace("</head>", () => `    <meta ${attr}="${name}" content="${value}" />\n  </head>`);
}

function page({ path, title, description }) {
  const url = SITE + (path === "/" ? "/" : path);
  let h = shell;
  h = h.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${esc(title)}</title>`);
  h = setMeta(h, "name", "description", description);
  h = setMeta(h, "property", "og:title", title);
  h = setMeta(h, "property", "og:description", description);
  h = setMeta(h, "property", "og:url", url);
  h = setMeta(h, "name", "twitter:title", title);
  h = setMeta(h, "name", "twitter:description", description);
  h = setMeta(h, "name", "twitter:url", url);
  // one canonical, replacing any the shell already had
  h = h.replace(/\s*<link rel="canonical"[^>]*>/gi, "");
  h = h.replace("</head>", () => `    <link rel="canonical" href="${url}" />\n  </head>`);
  return h;
}

/**
 * Check EVERY route, not a sample. The first version of this checked only
 * /press, whose copy happens to contain no "$" — so the $-expansion bug above
 * sailed through on the two routes that mention $20 and $15.99/mo, and shipped
 * a page with meta content spilled into the body.
 *
 * Two kinds of check: the metadata went in verbatim, and the document still has
 * the shape of a document.
 */
function problemsWith(route) {
  const html = page(route);
  const url = SITE + (route.path === "/" ? "/" : route.path);
  const problems = [];

  if (!html.includes(`<title>${esc(route.title)}</title>`)) problems.push("<title> not rewritten");
  if (!html.includes(esc(route.description))) problems.push("description not written verbatim");
  if (!html.includes(`rel="canonical" href="${url}"`)) problems.push("canonical missing");
  if (!html.includes(`content="${url}"`)) problems.push("og:url missing");

  // shape: exactly one of each, and the head still closes once
  const count = (re) => (html.match(re) || []).length;
  if (count(/<title>/gi) !== 1) problems.push(`${count(/<title>/gi)} <title> tags`);
  if (count(/rel="canonical"/gi) !== 1) problems.push(`${count(/rel="canonical"/gi)} canonical tags`);
  if (count(/<\/head>/gi) !== 1) problems.push(`${count(/<\/head>/gi)} </head> tags`);
  if (count(/<meta\s/gi) < 10) problems.push(`only ${count(/<meta\s/gi)} meta tags left`);

  // the tell-tale of a broken replacement: tag syntax loose in the body
  const body = html.slice(html.indexOf("</head>"));
  if (/"\s*\/>/.test(body)) problems.push('markup spilled into the body (found `" />` after </head>)');
  if (/content=/i.test(body)) problems.push("a meta attribute ended up in the body");

  return problems;
}

const broken = ROUTES.map((r) => [r.path, problemsWith(r)]).filter(([, p]) => p.length);
if (broken.length) {
  console.error("prerender: refusing to write — the rewrite is not clean:\n");
  for (const [path, problems] of broken) {
    console.error(`  ${path}`);
    for (const p of problems) console.error(`      ${p}`);
  }
  console.error(
    "\n  Fix scripts/prerender.mjs rather than shipping this. If a replacement\n" +
    "  string was used instead of a replacer function, copy containing $ will\n" +
    "  be read as a capture reference ($1, $2) and corrupt the document.\n"
  );
  process.exit(1);
}

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
