# redesign_2026

The 2026 redesign prototype. It lives on the **`dumb.co_redesign_v1`** branch of
this repo, alongside the app it will be ported into: the shippable site is still
the React 19 + Vite app at the repo root, and this folder is the design
prototype the sync reviews and the source of truth for what gets ported.

Nothing in here is part of the site build. Vite only bundles `src/` and copies
`public/`, so this folder is never deployed — it can't affect the live site.

```
concept/v6_baseline.html   the redesign as it stood before Kunal's notes (untouched)
concept/index.html         <- open this one. desktop, built output.
concept/mobile-current.html  a mirror of the site that is live today + memories
concept/quiz.html          the real subscription quiz, copied from reference/ by the build
build/build.py             builds index.html from v6_baseline + build/parts/*
build/build_mobile.py      builds the two mobile files (run build.py first)
build/build_review.py      builds the one offline file to send the team
build/serve.sh             serves concept/ on the wifi so a phone can open it
build/check_deploy.py      read-only pre-flight on the app before a deploy
build/check_routes.sh      asks a site for every route, prints the status code
build/serve_dist.sh        serves the app's dist/ like GitHub Pages would
HOSTING.md                 how dumb.co is hosted, and what a deploy does ship
SEO.md                     what has to happen for search, desktop + mobile
build/parts/*.css|*.js     the actual source: window controller, shop, memories, press
build/make_press_assets.py mirrors the live press data + makes thumbnails
assets/                    plan card PNGs + press thumbnails (embedded by the build)
reference/                 the mock-up deck export + the real subscription quiz
```

## Building

```
python3 build/make_press_assets.py   # only when press_data.md or its images change
python3 build/build.py
python3 build/build_mobile.py        # after build.py — mobile B is derived from its output
```

Idempotent, and it fails loudly rather than writing a half-built file. It never
re-types asset data — the baseline's ~2.6MB of inlined base64 is either left in
place or *moved* into a named const, so the output is not carrying duplicate
copies of the same photos. The 22 press images are resized to 220px WebP
thumbnails first (5.8MB of originals down to ~120KB).

Edit `build/parts/*`, not `concept/index.html` — it is generated and gets
overwritten on every build.

## Viewing

`concept/index.html` opens straight from disk, with one caveat inherited from v6:
FAQ.exe fetches the live published Google Sheet, which a `file://` page can't do.
Serve it to see that tab work:

```
python3 -m http.server 8000 -d concept    # then open localhost:8000
```

## One site, two shapes

`concept/index.html` is responsive. There is no separate mobile file any more —
Jack asked for one site, mobile-first, and two documents was exactly the drift
risk he was pointing at.

Below **760px** (`--bp-phone`, `build/parts/29_responsive.css`) the sidebar and
hero step out, the flip phone grows to fill the screen, and the `.exe` window
becomes a full-screen sheet. Nothing moves in the DOM — it is all position — so
crossing the breakpoint in either direction is reversible and there is nothing
to keep in sync. Cross it with the window open and the window minimises into the
egg while the handset zooms up, which is the transition Lafayette described.

**The handset is the nav.** The phone's screen carries the menu in both shapes,
so the phone and the window always say the same thing: open Shop and the screen
says Shop, minimise and it still says Shop. The highlight uses the sidebar's own
per-position colour cycle (pink, blue, orange, black) so the two can't drift.
Clicking the tab that is already highlighted pops the window back out of the egg.

**The D-pad is real.** The four drawn ovals are the keys — measured off
`assets/flipphone.png` at x 39.4/63.3% and y 55.4/63.2%, with OK at 52.1/59.3%.
They used to be a 3x3 grid whose cells landed in the gaps between the ovals, so
you were tapping bare artwork. Each hit area is a fixed 46px and carries an
arrow, because the ovals sit on the diagonals and position alone wouldn't say
which is which. Grant's snake still has first claim on those keys, unlock
sequence included.

### Testing it

- **On a laptop:** open the file and drag the window narrow past 760px. It
  should minimise into the egg and the phone should grow.
- **On a phone:** `bash build/serve.sh 8402` prints a wifi URL to type in.
- **`concept/mobile-current.html`** is unrelated and still built: it mirrors the
  site that is live today, with memories added.

## Addresses you can copy and paste

Every section has its own address, and the nav items are real `<a href>` links,
so right-click > copy link address works:

| section | prototype | after the React port |
| --- | --- | --- |
| Shop | `index.html#/shop` | `dumb.co/shop` |
| About | `index.html#/about` | `dumb.co/about` |
| Community | `index.html#/community` | `dumb.co/community` |
| Press | `index.html#/press` | `dumb.co/press` |
| Memories | `index.html#/memories` | `dumb.co/memories` |
| FAQ | `index.html#/faq` | `dumb.co/faq` |
| Contact | `index.html#/contact` | `dumb.co/contact` |

The prototype is one static file, so a pushState path like `/shop` would 404 the
moment anyone pasted it — the slug therefore rides in the hash. It copies,
pastes, bookmarks, reloads and back-buttons correctly. `ROUTES` in
`build/parts/24_routes.js` (generated from `NAV_ITEMS` in `build.py`) is the
exact slug map react-router should be handed on the port. See `SEO.md` — real
paths need prerendering, and the current GitHub Pages deploy would 404 them.

## Memories from a spreadsheet

`memories.exe` can read its events from a published Google Sheet instead of the
code — the same mechanism the FAQ already uses (`src/FAQContent.tsx` reads a
published sheet as CSV). One row per photo, event columns repeated:

| event | date | city | blurb | vimeo id | photo url | caption |
| --- | --- | --- | --- | --- | --- | --- |
| baird x dumb.co | coming soon | | | | | |
| Month Offline gallery | August 2026 | New York, NY | the gallery show… | | https://…/mo-1.jpg | opening night |

Row order is display order, so a new event pasted into the top rows lands at the
top of the page. An event with no photo rows renders "photos coming soon".

Paste the published CSV link into `MEMORIES_CSV_URL` at the top of
`build/parts/23_memories_sheet.js` and rebuild. Until then the events written
into that file are what shows — and they stay as the fallback, so an unreachable
or empty sheet can never blank the page.

The sheet holds *links* to photos, not the photos themselves, so the images need
somewhere public to live (a Cloudinary/S3/Vercel Blob bucket is the reliable
option; Drive share links are throttled and not meant for hotlinking).

## Feature flags

Both of the things Kunal asked us to hold are built and gated at the top of the
script (`build/parts/05_data.js`):

| flag | default | note |
| --- | --- | --- |
| `SHOW_PLAN_CARDS` | `false` | his note 4 — plan cards are embedded and laid out, just hidden |
| `SHOW_QUIZ` | `false` | his note 5 — teaser + the second pop-up window both work |

Flipping either to `true` and rebuilding is the whole change, so Wednesday can be
a decision rather than a work item.

## Where the code is (opening this in VS Code)

```
code ~/Desktop/dumb.co_code/dumb.co        # then open redesign_2026/
```

Nothing here is a framework — no npm install, no build server. It's one Python
script that assembles text files into one HTML file.

**Read it in this order:**

1. **`build/build.py`** (~450 lines) — the assembler, and the map of everything
   else. Top to bottom it: copies the real quiz beside the output, pulls named
   base64 assets out of the baseline, embeds the photoshoot / memories / press /
   plan-card / duck / flip-phone images, rewrites the nav, swaps each section's
   body for the matching file in `parts/`, injects the data and the window
   controller, then runs a list of `must()` assertions over the result. It fails
   loudly instead of writing a half-built file, and it writes only after every
   edit has landed.
2. **`build/parts/`** — the actual source, in load order. The number prefix is
   the order they're concatenated:

   | file | what it is |
   | --- | --- |
   | `01_wm.css` | the one reusable `.exe` window |
   | `02_shop.css`, `06_shop_section.js` | Shop.exe — hero, gallery, spec, reviews |
   | `03_memories.css`, `07_memories_section.js` | Memories.exe |
   | `04_wm.js` | the window controller: `EXE` titles, `openSection`, `goHome`, sizing |
   | `05_data.js` | all the content data — plans, features, reviews, `MEMORY_EVENTS`, confetti |
   | `08_helpers.js` | small shared bits (carousel, `setTeamPhoto`) |
   | `09_press.css`, `10_press_section.js` | Press.exe, on Matteo's palette |
   | `11_involved_section.js`, `12_involved.css` | DumbCampus.exe |
   | `14_contact_section.js` | Contact.exe |
   | `15_about_section.js` | about.exe |
   | `16_faq_section.js`, `17_faq.js` | FAQ.exe + the live sheet fetch |
   | `18_quiz.css` | quiz frame, plan table, contact, about, the flip-phone frame |
   | `19_duck.css`, `20_duck.js` | the walking duck |
   | `21_snake.js`, `22_snake.css` | Grant's snake, ported from `src/Phone/SnakeGame.tsx` |
   | `23_memories_sheet.js` | Memories from a published Google Sheet |
   | `refresh_faq_snapshot.py` | re-downloads the FAQ sheet into `assets/faq_snapshot.csv` |
   | `24_routes.js` | the addressable sections (`#/shop` → `ROUTES`) |
   | `29_responsive.css`, `30_phone.js` | the phone layout and the handset menu |
   | `m01_mobile.css`, `m02_mobile.js` | retired with mobile-new.html |
   | `m10_current.html` | version A, whole file |

3. **`concept/v6_baseline.html`** — the snapshot the build starts from. Never
   edited by hand or by the build; it holds the base styles and the ~2.6MB of
   inlined base64 the build reuses instead of re-typing.
4. **`concept/index.html`** — **generated. Don't edit it.** Every build
   overwrites it. If a change needs to stick, it goes in `build/parts/` or
   `build/build.py`.

**To change something:** edit the part, run `python3 build/build.py`, then
`python3 build/build_mobile.py`, then reload the file in the browser. The two
builds take a couple of seconds each.

**The asset generators** are separate and only need re-running when their inputs
change: `make_press_assets.py` (mirrors `src/Press/press_data.md` from the app and
resizes the 22 thumbnails), `make_memory_assets.py` (the event photos),
`make_campaign_assets.sh`.

**What this becomes:** the React app at the repo root is the thing that ships.
The pieces that port more or less directly are `04_wm.js` → the existing
`src/WindowModal/`, `05_data.js` → a data module or the sheet, `24_routes.js` →
react-router routes, and `21_snake.js` back onto `src/Phone/SnakeGame.tsx`,
which is where it came from.

## FAQ.exe and the sheet

FAQ.exe showed nothing but "questions are loading in from the sheet". The live
site reads the FAQ from a published Google Sheet as CSV, and the prototype
copied that — but Google's published-CSV URL redirects to a googleusercontent
host that sends no CORS header on the final hop, and a page opened from a
`file://` path has a null origin on top of that. So the fetch failed and there
was nothing behind it.

The build now embeds a snapshot of the sheet (`assets/faq_snapshot.csv`, 36
questions) as `FAQ_SNAPSHOT`. FAQ.exe renders that instantly, with no network
at all, then still tries the live sheet and replaces the list if that succeeds.
Working from a file, on a plane, or in front of Kunal, the questions are there.

When the sheet changes:

```
python3 build/refresh_faq_snapshot.py    # needs network; refuses to write a short sheet
python3 build/build.py
python3 build/build_mobile.py
```

## Keyboard

Both builds take the same keys.

| key | what it does |
| --- | --- |
| ↑ ↓ (and ← →, desktop) | move through the tabs |
| return / space | open the highlighted tab |
| escape | minimise — desktop shrinks the window into the egg, mobile closes the sheet back to the phone |

On the desktop the cursor is a black outline on the sidebar item; on mobile it's
the highlighted row on the phone's screen. Clicking a tab moves the cursor
there too, so the mouse and the keyboard don't disagree.

Two deliberate exceptions. While the desktop window is minimised into the egg
the arrows belong to snake, including its ↑↑↓↓←→ unlock, so they don't move the
tabs. And on mobile the arrows only work with the sheet closed, since the menu
is behind it — escape first, then arrows.

Watch out for double handling if you touch this: `build/parts/21_snake.js`
already listens for the arrows and calls `teamKey()`, and the mobile shell's
`teamKey` wrapper sends them to the menu. Handling them again in
`m02_mobile.js` moved the highlight twice per press. Likewise `27_keys.js`
checks for the mobile shell **inside** its handler, not at load time — the
mobile shell is built after that file runs, so a load-time check saw nothing
and left both handlers live.

## Where the meeting notes landed

| note | where it lives |
| --- | --- |
| Shop before About; Month Offline out of the nav | `build/build.py` > `NAV_ITEMS` |
| Get Involved + MO merge into **Community**, as dropdowns | `build/parts/11_involved_section.js` (file keeps its old name), `12_involved.css` |
| "your life is waiting for you" centred in its column | `build/parts/18_quiz.css` > `#home-copy` |
| Contact type bigger, blocks fill the card | `build/parts/18_quiz.css` > the `.contact-card.support` block — six lines, each labelled |
| one responsive site, breakpoint + zoom transition | `build/parts/29_responsive.css` |
| handset mirrors the window, D-pad, click-the-active-tab | `build/parts/30_phone.js` |
| arrows on the drawn ovals, 46px targets | `build/parts/22_snake.css` > `.pf-keys` |
