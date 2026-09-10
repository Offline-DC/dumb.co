# dumb.co redesign — status

Prototype: `concept/index.html`. Open it from Finder, or serve `concept/` if you
want FAQ.exe's live sheet fetch to work. Launch Fri 18 Sep, sync Wed 16 Sep.

## How it works

One pop-up window, reused. `#winmodal` is flipoff.exe on the home state; nav
items retitle it and swap its contents — `about.exe`, `Shop.exe`,
`DumbCampus.exe`, `Press.exe`, `Memories.exe`, `FAQ.exe`, `Contact.exe`,
`quiz.exe`. Black title bar throughout. Logo or Escape restores flipoff.exe.
It drags, resizes from both bottom corners, and collapses into the egg.

Month Offline is not an .exe — it's a real link in the nav to
`https://offline.community`, with an outlined box so it reads as leaving the site.

## Kunal's original notes

| # | Ask | Status |
| --- | --- | --- |
| Shop 1 | customer reviews at the bottom | Built as a carousel. Copy is placeholder. |
| Shop 2 | device photo, description, people using it | Built. Hero with thumbnail switcher, spec panel, "who's on one" photo carousel. Photos/names are stand-ins. |
| Shop 3 | 4 month min visible and clearly stated | Highlighted spec bullet, repeated on the quiz result. |
| Shop 4 | plan cards | Live inside the quiz result and the "all three plans" view. The standalone "the plans" section stays off (`SHOW_PLAN_CARDS`), since the quiz now does that job. |
| Shop 5 | quiz in a pop-up | Built and on. See below. |
| Brand | header per event, carousel + video, click a photo for the description | Built. Four events, photo carousel, in-window detail with prev/next. |
| Other | Month Offline tab | Built as a link. |

## The subscription quiz

"shop dumbphone 2" (the buy strip, and the spec-panel link) opens `quiz.exe`,
which frames **the real quiz** — the final build that had gone missing in
Downloads as `index_10.html`. It lives at
`reference/subscription-quiz-FINAL-2026-08-18.html` and the build copies it to
`concept/quiz.html`, so the quiz stays one source of truth: drop a newer export
in `reference/` and rebuild.

Framing it rather than re-typing its questions means the prototype shows the
approved copy exactly — the welcome screen, both questions, the phone-number
recommendation and the plan result. The build injects `<base target="_blank">`
into the copy so its one outbound link (the gigs activation page) opens in a new
tab instead of navigating inside the little window. There's also an "open on its
own" link in the quiz.exe title area.

The placeholder two-question quiz I had written is gone. The plan comparison it
used to lead to survives as "compare all three plans" in the spec panel.

## Also done this round

- **Two new Phone Demo videos.** FAQ.exe → Phone Demo now has three: `setting up the dumbphone 2` (1205491825), `setting up the dumb plan` (1209576549), `T9 bootcamp! (& voice 2 text)` (1215826540). Titles are Vimeo's own for each ID.
- **Get Involved condensed** to a single panel: project xtra-ordinary plus the group-discount line, one email.
- **Contact is the support card only**, on the yellow ground from slide 9. Team moved out.
- **Team lives in about.exe** now, under the signatures, with the same hover-a-name-see-a-photo behaviour.
- **All the technical notes are gone** — the dev-note banners, the CORS/sandbox explanation on FAQ, the Stripe-ID and Vimeo-watermark asides, the "mirrors the current site" captions.
- **No duck on the desktop.** See below.
- **Black title bars everywhere**, confirmed over the Win95 blue.

## The duck

To answer the question directly: no, the duck was never in Kunal's notes and it
isn't in the deck. It was v6's top-bar mascot, and v8 removed the top bar, so I
moved it to the desktop rather than lose it. That placement was my call and it
was a bad one — bottom-right, facing right, nose to the edge of the screen.
It's out now.

Your instinct about direction is right, and it isn't a logo question. The duck is
a walking figure, and a walking figure reads as walking *into* the page or *out*
of it. Bottom-right facing right walks it off the edge; bottom-left facing right
walks it across the page. If it comes back, bottom-left is the spot — same
artwork, no flip needed.

## Still needed

**Memories** — the real four events and dates (the deck names `baird x dumb.co`;
the other three are inferred from press coverage), a recap paragraph each, the
photo selects (there are no event photos in the repo — tiles borrow flipoff.exe
shots), and Vimeo IDs for the event videos. The bonfire photo on the Memories
slide isn't in the repo either.

**Shop** — the real reviews and where they come from (a published Google Sheet
like the FAQ's would let this pull live); names, cities, one-liners and photos
for the user carousel; the smartphone coffin's Stripe product/price ID and a real
photo; and confirmation that friend fone maps to the existing "dumb family (2+)"
product.

**FAQ** — their live /faq/videos page shows a video titled "setting up the dumber
plan" that no link was sent for. Is there a fourth video, or is that the same one
as "setting up the dumb plan" with a different title?

## One change outside this folder

`dumb.co/src/Press/press_data.md` line 62: `dazed month offline mag.avif` →
`dazed month offline.avif`. `parsePressData.ts` drops any item whose image can't
be resolved, so that Dazed item was silently missing from the live press page.
Uncommitted. `git checkout -- src/Press/press_data.md` reverts it.

## Wednesday agenda

1. Sign off the quiz — question copy, and whether the skip-to-checkout link stays.
2. Sign off the Memories structure, then hand over events + photos + videos.
3. Reviews: source and copy.
4. **The port.** This is still a prototype. What ships Friday is the React app,
   where the one-window controller, Shop.exe, the quiz, Memories.exe and the
   Month Offline link all have to be rebuilt as components. Press.exe is the
   cheap one — it mirrors components that already exist. Two days between the
   sync and launch is the real risk; worth agreeing what ships and what slips.
