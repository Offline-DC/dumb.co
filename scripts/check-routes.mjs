#!/usr/bin/env node
/**
 * Asks a site for every page in dist/ and prints the status code: 200 is a
 * real page, anything else is a problem for visitors and for search engines.
 *
 *   npm run build && npm run check:routes                      # dumb.co
 *   npm run check:routes -- http://localhost:4321              # npm run preview
 *
 * The list comes from the last build, so it is always the pages that exist.
 */
import { readdirSync } from "node:fs";

const base = (process.argv[2] || "https://dumb.co").replace(/\/$/, "");
const pages = readdirSync(new URL("../dist/", import.meta.url))
  .filter((f) => f.endsWith(".html") && !["404.html", "quiz.html"].includes(f))
  .map((f) => (f === "index.html" ? "/" : "/" + f.replace(/\.html$/, "")));
const paths = [...pages.sort(), "/robots.txt", "/sitemap-index.xml", "/this-page-does-not-exist"];

let bad = 0;
console.log(`\n  ${base}\n`);
for (const p of paths) {
  const want = p === "/this-page-does-not-exist" ? 404 : 200;
  let status = "ERR";
  try {
    status = (await fetch(base + p, { redirect: "manual" })).status;
  } catch {}
  const ok = status === want;
  if (!ok) bad++;
  console.log(`  ${ok ? "ok " : "!! "} ${String(status).padEnd(4)} ${p}`);
}
console.log(bad ? `\n  ${bad} problem(s)\n` : "\n  all good\n");
process.exit(bad ? 1 : 0);
