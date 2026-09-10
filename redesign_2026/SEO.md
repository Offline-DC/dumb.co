# SEO — what has to happen, desktop and mobile

Written against the live app (the repo root) and this prototype. The prototype
isn't the thing Google crawls, so most of this is about what the React port
must do differently from what the site does today.

## The blocker nobody has hit yet

`../.github/workflows/deploy.yml` deploys to GitHub Pages and fakes SPA routing
with:

```yml
- name: Create 404.html for SPA routing
  run: cp dist/index.html dist/404.html
```

That serves the app for any path, but GitHub Pages sends it with an **HTTP 404
status**. Browsers ignore the status, crawlers don't — Search Console reports
those URLs as "not found" and won't index them. So the moment we ship
`dumb.co/shop`, `dumb.co/get_involved` and the rest as real paths (Jack's note),
every one of them is unindexable on the current hosting. Only `/` works today,
which is also why only `/` is really in the index right now.

Two ways out, and they stack:

1. **Prerender each route to a real file.** `react-router-dom` is already at
   7.6, and React Router 7 framework mode can prerender with no server:

   ```ts
   // react-router.config.ts
   export default {
     ssr: false,
     prerender: ["/", "/about", "/shop", "/get_involved", "/press",
                 "/memories", "/faq", "/contact"],
   } satisfies Config;
   ```

   That writes `build/client/shop/index.html` — a real file, HTTP 200, with the
   section's actual text in the HTML. Works on GitHub Pages as-is. This is the
   one that matters most.
2. **Or move hosting** to Cloudflare Pages / Netlify / Vercel, where an SPA
   rewrite returns 200. Fixes the status code but still ships an empty
   `<div id="root">` to the crawler, so prefer 1 — or do both.

## What a crawler sees today

- One `<title>` (`dumb.co`) and one meta description for the whole site, set in
  `index.html`. Every route is therefore identical to a search engine.
- No `robots.txt` and no `sitemap.xml` anywhere in `public/`.
- All copy is rendered by JS, and in the redesign it lives inside a modal.
  Google does execute JS, but it's a second pass and a weaker signal — and none
  of it survives if the route 404s (above).
- `og:url`, `og:title` and `canonical` are hardcoded to the homepage, so a
  shared `/shop` link previews as the homepage.

## The list, in order

1. **Real prerendered routes** — as above. Slugs are already fixed in the
   prototype (`build/parts/24_routes.js` → `ROUTES`), so the port inherits them:
   `about, shop, get_involved, press, memories, faq, contact`.
2. **Per-route metadata** — unique `<title>` (~50–60 chars), `meta description`
   (~150), `<link rel="canonical">`, and per-route `og:*` / `twitter:*`. In
   framework mode that's the route's `meta()` export.
3. **`robots.txt` + `sitemap.xml`** in `public/`, sitemap listing the seven
   routes, and submit it in Search Console.
4. **The copy has to exist in the HTML, not only in the modal.** The `.exe`
   window is the presentation; each route should still render its own `<h1>`
   and body text into the document. Right now "your life is waiting for you"
   and every shop bullet are strings in a JS template — prerendering fixes this
   for free, but only if the section content is part of the route, not injected
   after a click.
5. **Structured data** (JSON-LD): `Product` + `Offer` for the dumbphone 2 ($20,
   plans from $15.99/mo, 4-month minimum), `Organization` for dumb.co,
   `FAQPage` for FAQ.exe, and `LocalBusiness` + `AggregateRating` once the
   Google reviews API is wired — only mark up ratings that are actually shown
   on the page, or it's a manual-action risk.
6. **Images.** This prototype inlines ~6MB of base64 because it has to be one
   file. That must not ship. Real deploy: hashed image files, WebP/AVIF,
   `srcset` + `sizes`, `loading="lazy"` below the fold, explicit `width`/
   `height` to stop layout shift, and real `alt` text on every photoshoot and
   memories image (they're all `alt="dumb.co"` or the event name right now).
7. **Mobile = the same URLs.** One responsive site, not an `m.` domain and not
   a separate mobile build in production. Google indexes **mobile-first**, so
   whatever the phone layout omits is effectively missing from the index. Worth
   knowing about the current mobile prototype: the phone-screen menu drops the
   hero copy ("your life is waiting for you", the kicker, the intro paragraph)
   because the phone fills the viewport. That's fine for a design review, but
   the shipped mobile layout needs that text present in the document — even if
   it's below the phone or inside the first `.exe` — or we lose the homepage's
   only real body copy on the version Google actually ranks.
8. **Performance** (Core Web Vitals, and they're ranking signals): self-host
   the fonts instead of two blocking `fonts.googleapis.com` stylesheets, keep
   `font-display: swap`, code-split the modals so the homepage isn't carrying
   the press mirror and the quiz, and watch LCP on the hero image.

## How to test and compare

| what | where | what it tells you |
| --- | --- | --- |
| Lighthouse (mobile + desktop) | Chrome DevTools > Lighthouse | per-page SEO/perf/a11y score, lab data |
| PageSpeed Insights | pagespeed.web.dev | the same audit plus real-user field data |
| URL Inspection | Search Console > any URL > "Test live URL" > View crawled page | **the rendered HTML Google actually got** — this is where a 404 route or an empty `#root` shows up |
| Pages / Indexing report | Search Console | which URLs are indexed, and the reason each excluded one was skipped |
| Rich Results Test | search.google.com/test/rich-results | whether the Product / FAQ / LocalBusiness JSON-LD parses |
| `curl -s https://dumb.co/shop \| head -60` | terminal | the crawler's first look, before any JS runs |
| `curl -sI https://dumb.co/shop` | terminal | the status code — this is the GitHub Pages 404 test, one command |
| `site:dumb.co` | Google | what's indexed today. Baseline before changes. |
| Screaming Frog (free ≤500 URLs) | desktop app | full crawl: titles, descriptions, status codes, redirects |
| Ahrefs / Semrush free tools | web | keyword and backlink comparison against other dumbphone brands |

Order of operations for measuring: run `curl -sI` on each planned route and
Lighthouse-mobile on `/` **before** the port, so there's a baseline to compare
against after prerendering lands.
