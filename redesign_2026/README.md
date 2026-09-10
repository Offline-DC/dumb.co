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
concept/mobile-current.html  mobile A: the site that is live today + memories
concept/mobile-new.html      mobile B: this redesign on a phone
concept/mobile-new-big.html  mobile B, phone scaled up (alt, if B reads small)
concept/quiz.html          the real subscription quiz, copied from reference/ by the build
build/build.py             builds index.html from v6_baseline + build/parts/*
build/build_mobile.py      builds the two mobile files (run build.py first)
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

## The two mobile builds

Two separate files, so they can be reviewed side by side and either one can be
thrown away without touching the other.

**`concept/mobile-current.html` — version A.** A standalone mirror of the site
that is live today: same handset geometry, olive screen, keypad and footer as
`../dumb.co/src/Phone/*`, with **memories** added to the home menu. Pick an
event, then ← / → (or swipe) through its photos. baird shows "photos coming
soon". No build step at runtime, no network calls.

**`concept/mobile-new.html` — version B.** This redesign on a phone. The home
state *is* the phone: the flip-phone illustration is scaled to fill the
viewport, the side-menu is rendered onto its screen, and the drawn D-pad moves
the highlight (OK / → opens; rows are tappable too). Choosing an item opens the
same `.exe` window the desktop uses as a **full-screen sheet**, closed with the
red button in its title bar. Generated from `concept/index.html` plus
`build/parts/m01_mobile.css` and `m02_mobile.js`, so it runs the *same* data and
the *same* section bodies as the desktop concept and cannot drift from it.

The phone is sized from the illustration's alpha box, not the file: the PNG
carries ~27% transparent margin on each side, so `mFit()` in `m02_mobile.js`
scales the image until the *drawn* phone fills the stage, then divides the drawn
screen by the number of menu items so all eight always fit without scrolling
(checked at 360×740, 390×844 and 430×932).

**Two sizings, same page.** `mobile-new.html` fits the whole handset on screen.
`mobile-new-big.html` is the same file with `window.DUMB_MOBILE_FIT = 'dpad'`
set before the script runs: `mFit()` then scales the phone until the D-pad
reaches the bottom of the screen rather than the whole phone, so the menu type
goes from ~12px to 17px and the number keys crop off below. The D-pad is still
fully on screen — it's the last thing that has to fit. Keep both for the review
and drop whichever loses.

**A first-run card explains the controls** ("to navigate, use the d-pad on
screen or click on the tab you would like to see"), once per tab, with a `?`
badge top-right to bring it back. A phone-shaped menu isn't a convention anyone
has seen before.

**The duck is deliberately not on mobile.** It walks between the logo and the
egg, and neither exists on the phone layout.

### Testing them — and verifying the mobile one actually works

**On a laptop, in a minute.** Open `concept/mobile-new.html`, then Chrome >
devtools (⌥⌘I) > the phone icon in the toolbar > pick "iPhone 14 Pro" >
**reload**. The reload matters: the layout is measured on load. Rotate with the
icon at the right of the device bar to check landscape.

**On your actual phone, which is the test that counts.** From this folder:

```
bash build/serve.sh
```

It prints the URL to type into Safari on the phone — same wifi, no AirDrop, no
6MB transfer, and reloading the phone picks up a rebuild instantly. This is also
the only way FAQ.exe works, since it fetches the published sheet and a `file://`
page can't.

**What to check off** (this is the list I run after every build):

| | expected |
| --- | --- |
| load | the phone fills the screen, menu on its screen, nothing cut off, no sideways scroll |
| D-pad | the small keys around OK move the highlight; OK and → open the highlighted item |
| tap | tapping a row opens it directly |
| sheet | the .exe fills the whole screen — no gap at the top or bottom |
| red button | closes the sheet and puts you back on the phone |
| Month Offline | leaves for offline.community in a new tab, does not open a sheet |
| shop | photos swipe, gallery scrolls, "click here to buy" reachable |
| memories | baird says "photos coming soon"; the others' photos swipe and open |
| press | rows all one colour, each opens its article |
| faq | questions load (served, not `file://`) |
| address | `…/mobile-new.html#/shop` opens straight into Shop.exe |
| rotate | landscape still fits, phone rescales |
| small phone | repeat at 360×740 in emulation — the menu must still fit without scrolling |

Automated on my side, at 360×740, 390×844 and 430×932: every row taps open,
every sheet is exactly viewport-sized, no horizontal overflow in any section,
the red button closes each one, and no console errors. Re-run that after any
change to `m01_mobile.css` / `m02_mobile.js` and it should stay silent.

Neither file writes anything into the app, and nothing in this folder does.

## Addresses you can copy and paste

Every section has its own address, and the nav items are real `<a href>` links,
so right-click > copy link address works:

| section | prototype | after the React port |
| --- | --- | --- |
| About | `index.html#/about` | `dumb.co/about` |
| Shop | `index.html#/shop` | `dumb.co/shop` |
| Get Involved | `index.html#/get_involved` | `dumb.co/get_involved` |
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
   | `m01_mobile.css`, `m02_mobile.js` | the mobile shell for version B |
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
