# dumb.co

The dumb.co website: an [Astro](https://astro.build) site, built into plain
HTML -- one file per page, with the content already in it -- and served by
GitHub Pages at https://dumb.co.

## Running it

Needs Node 22.12 or newer.

```
npm install
npm run dev            # http://localhost:4321, reloads as you edit
npm run build          # dist/, exactly what gets deployed
npm run preview        # serves dist/ to check a build
```

## How it fits together

```
src/pages/              one file per address
  index.astro           /
  [section].astro       /shop /about /community /press /memories /faq /contact
  [...legacy].astro     /support /setup /internship /android ... (older React pages)
  404.astro             anything else
src/site/               the new site
  Site.astro            the page: <head> (title, description, share cards,
                        structured data), sidebar, the .exe window, the phone
  sections/*.astro      what goes in the window, one per section
  lib/content.ts        reads src/content/*.json, with fallbacks
  lib/assets.ts         every image, resized and converted to WebP at build
  scripts/site.js       what moves: the window, the phone and its keys,
                        snake, the duck, switching sections without a reload
  styles/               the stylesheet, in load order
  assets/               images, fonts, memories photos (CMS uploads land here)
src/content/            the words, press, memories, FAQ -- edited in Pages CMS
src/Press/images/       press images (CMS uploads land here)
src/legacy/             the older pages' React app and their list of routes
public/                 copied as-is: favicon, share image, downloads, quiz.html
```

**Every page is real HTML.** `/faq` arrives with all its questions in the
markup, `/shop` with the specs and reviews, each with its own `<title>`,
description, canonical link and structured data (FAQPage on /faq, Product on
/shop). Search engines and link previews read it without running JavaScript.
`site.js` then makes it the interactive desktop; moving between sections
happens in place (the other sections ride along as `<template>`s), with the
address following.

**The older pages** -- support, setup, internship, the download hand-offs --
are the same React components as before, mounted by Astro. `/internship` and
`/dumbdown` are rendered to HTML at build time too. Adding one is a line in
`src/legacy/routes.ts` and a `<Route>` in `src/legacy/LegacyApp.tsx`.

**Old addresses** -- `/phone`, `/faqs`, `/faq/videos` -- redirect to their new
homes (`astro.config.mjs`, and `src/pages/404.astro` for `/faq/videos`).

## Deploying

Every push to `main` builds and publishes to dumb.co
(`.github/workflows/deploy.yml`). Pushes to `dumb.co_redesign_v1` publish the
preview at offline-dc.github.io/dumb.co-redesign-preview
(`.github/workflows/redesign-preview.yml`; `npm run build:preview` builds it
locally under that sub-path).

## Editing content (Pages CMS)

The new site's words, press, memories and FAQ are edited at
**https://app.pagescms.org**. No code, and no GitHub account needed for people
you invite. The forms are defined in `.pages.yml`; the content is the JSON in
`src/content/`; Astro bakes it into the pages at build time.

| In Pages CMS | What it changes |
|---|---|
| **Press** | press.exe: articles, images, order |
| **Memories** | memories.exe: events and photos |
| **FAQ** | faq.exe: questions, answers, tabs, videos (replaces the Google Sheet) |
| **Site copy** | home, about.exe, shop.exe, community.exe |
| **Site settings** | each page's title and description for Google and link previews, support email/phone/hours |

### Where an edit goes

Every save in Pages CMS is a commit to **the branch picked at the top of the
CMS**. What that commit does depends on the branch:

| Branch | A save... |
|---|---|
| `dumb.co_redesign_v1` (now, before launch) | rebuilds the preview at offline-dc.github.io/dumb.co-redesign-preview in a minute or two (`.github/workflows/redesign-preview.yml`) |
| `main` (after launch) | rebuilds dumb.co (`.github/workflows/deploy.yml`) |

Until launch, keep the CMS on `dumb.co_redesign_v1`: that is where these
forms and files exist. `main` has neither until the redesign is merged, so
Pages CMS shows nothing to edit there. Edits made on the redesign branch
travel to `main` with the merge; nothing has to be copied over.

### One-time setup

1. Sign in at app.pagescms.org with a GitHub account that has access to
   `Offline-DC/dumb.co`, and install the Pages CMS GitHub App on the repo when
   asked.
2. Open the repo and switch the branch to `dumb.co_redesign_v1`.
3. Invite the team under **Collaborators** (by email).
4. For the preview to rebuild on its own, add the deploy key described at the
   top of `.github/workflows/redesign-preview.yml`.
