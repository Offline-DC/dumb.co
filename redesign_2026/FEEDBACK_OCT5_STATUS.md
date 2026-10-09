# Redesign feedback: status as of Oct 9

This covers everything sent on the email threads "Dumb.Co Redesign
Finalisation" (Sep 15–20) and "Website Redesign (final stretch before launch)"
(Oct 1–6). Most of the Sep 15–Oct 2 notes were already handled in Laffy's
Oct 2 commits. This round covers what came in after the Oct 2 preview, plus
the two items that were still open from before it.

## Done in this branch

| # | from | ask | where |
| --- | --- | --- | --- |
| 1 | Jack (blocker) | on mobile the dumb.co logo on the hinge does nothing when tapped | `29_responsive.css` > `#logo.on-hinge` |
| 2 | Jack (blocker) | on iPad/medium widths the section windows were too small and couldn't be navigated: drop the hero and let the window use that space | `29_responsive.css`: the 761–1250px block. Only while a section is open; the home page is unchanged |
| 3 | Jack (blocker, asked twice) | `/about`, not `/#/about` | `24_routes.js`, `build/spa_server.py`, `build.py` nav hrefs |
| 4 | Jack (nice-to-have) | up/down key targets as tall as they are wide | `22_snake.css`, under the generated d-pad block |
| 5 | Jack (nice-to-have) | keys look pressed when pressed, like the current site | `22_snake.css` > PRESSED, `30_phone.js` > `keyDown` |
| 6 | Jack (Sep 15 + Oct 2) | double-tap still zoomed on mobile | `29_responsive.css`: `touch-action` on every element, not just `html`/`body` |
| 7 | Kunal | larger `.exe` titles on mobile | `29_responsive.css`: 22px title, 58px bar, 44px close |
| 8 | Kunal | confetti ("neurons") over the Shop hero text on mobile | `05_data.js` > `DOTS_SHOP_NARROW`, `02_shop.css` |
| 9 | Matteo | the phone shakes only the first time | `30_phone.js` > `touchNudge` (once per tab) |
| 10 | Matteo | nudge copy: "helping you get ready for the dumb life" (Cheltenham) / "try clicking the buttons below" (Helvetica) | `30_phone.js`, `29_responsive.css` |
| 11 | Matteo + Kunal | 60px → 32px side margins in the windows on mobile | `29_responsive.css` (about.exe and the contact card were the two over 32px) |
| 12 | Matteo | remove the second "buy" right under the main one | `06_shop_section.js` |
| 13 | Matteo | a buy CTA at the end of the Shop page | `06_shop_section.js` > `.sh-end`, `02_shop.css` |

Also fixed along the way: opening a deep link on a phone (e.g. `/shop`)
collapsed the section straight back to the handset menu, and a deep link to
FAQ threw `faqItems` before initialization. Both were already happening with
`#/shop` links.

## Not done: needs an asset, access, or a decision

- **Marco's wider phone ("wide boy.png") and his outlined arrows.** Matteo
  asked Marco for the arrows to sit further from OK, and Jack and Matteo agreed
  on "a light hand-drawn stroke around the button". The art is an email
  attachment that isn't in the repo yet. Once it's in `assets/`, run
  `expand_screen.py` and `trace_screen.py`.
- **Matteo's button component** from the dumb design system in Figma (node
  395-492). Use it for "click here to buy". The Figma file wasn't accessible
  from here. Kunal wanted the button centered and Matteo didn't, so it stays
  left-aligned for now.
- **Sonya: "shop" wording.** She suggested "the dumbphone shop" or "get
  dumbphone 2" instead of "shop" as a call to action, and flagged two items as
  redundant (her screenshot, numbers 3 and 4). She sent it to Kunal to triage.
- **Sonya: the site doesn't explain Smart Music.** This needs copy.
- **Danny / Lydia: internships.** Either add the internship listing to
  Community, or rename About to "Team" with a "Join the Team" list of Handshake
  jobs. This needs a decision and the Handshake links.
- **Kunal (Sep 20): windows open from the flip phone on mobile**, the way the
  current site does, instead of as a full-screen sheet. Not raised again since
  the Oct 2 build, and Jack's family liked the current behaviour.
- **Memories photos** (waiting on approved material) and **Lucy's photos**.
- **Milk:** a 15-minute session on the product page.
