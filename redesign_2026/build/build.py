#!/usr/bin/env python3
"""
Builds concept/index.html from concept/v6_baseline.html + build/parts/*.

Surgical, idempotent, re-runnable. The baseline carries ~2.6MB of inlined
base64 assets, so nothing here re-types asset data: images are either left
exactly where they are or MOVED into a named const and referenced.

v8: one reusable .exe window (the mock-up deck shows a single pop-up per slide),
and Press.exe mirrors the live React press page.
"""
import base64, json, os, re, sys, pathlib

ROOT  = pathlib.Path(__file__).resolve().parent.parent
PARTS = ROOT / "build" / "parts"
SRC   = ROOT / "concept" / "v6_baseline.html"
OUT   = ROOT / "concept" / "index.html"   # index so `http.server -d concept` serves it at /
QUIZ_SRC = ROOT / "reference" / "subscription-quiz-FINAL-2026-08-18.html"
QUIZ_OUT = ROOT / "concept" / "quiz.html"

def part(name):
    return (PARTS / name).read_text(encoding="utf-8")

def must(cond, msg):
    if not cond:
        sys.exit("BUILD FAILED: " + msg)

def swap_block(text, start, end, new):
    i = text.find(start)
    must(i != -1, f"marker not found: {start.strip()[:44]}")
    j = text.find(end, i)
    must(j != -1, f"end marker not found: {end.strip()[:44]}")
    return text[:i] + new + text[j:]

html = SRC.read_text(encoding="utf-8")

# ---- the real subscription quiz, copied beside index.html so quiz.exe can
# frame it. Source of truth is the file in reference/ — the final build that
# was sitting in Downloads as index_10.html. Its one outbound link (the gigs
# activation page) is retargeted so it opens in a new tab instead of
# navigating inside the little window.
must(QUIZ_SRC.exists(), f"missing {QUIZ_SRC.name} — the real quiz should live in reference/")
quiz = QUIZ_SRC.read_text(encoding="utf-8", errors="replace")
must("<head>" in quiz, "quiz has no <head> to inject into")
if "<base " not in quiz.lower():
    quiz = quiz.replace("<head>",
        '<head>\n<base target="_blank" />'
        "<!-- injected by build.py: keeps outbound links out of the quiz.exe frame -->", 1)
QUIZ_OUT.write_text(quiz, encoding="utf-8")
print(f"  wrote {QUIZ_OUT.relative_to(ROOT)}  ({len(quiz):,} chars)")

# ---------------------------------------------------------------- 1. assets
def grab(alt):
    m = re.search(r'src="(data:image/[^"]+)"\s+alt="' + re.escape(alt) + r'"', html)
    must(m, f'could not find inlined image with alt="{alt}"')
    return m.group(1)

assets = {
    "phone":      grab("dumbphone 2"),
    "polaroid":   grab("dumb.co team polaroid"),
    "madeindc":   grab("made in D.C."),
    "coffin":     grab("smartphone coffin"),
    "friendfone": grab("friend fone"),
    "people1":    grab("friends getting ice cream"),
    "people2":    grab("friends looking at the skyline, no phone zone"),
}
for key, fname, mime in [("planDumb",    "dumb plan card new.png",    "png"),
                         ("planDumber",  "dumber plan card new.png",  "png"),
                         ("planDumbest", "dumbest plan card new.png", "png"),
                         # three real campaign photos, so no photo repeats inside
                         # a window (see build/make_campaign_assets.sh for how
                         # they were pulled out of the carl flyer PDFs)
                         ("camp1", "campaign-dumb-effect.jpg",            "jpeg"),
                         ("camp2", "campaign-so-many-smart-people.jpg",   "jpeg"),
                         ("camp3", "campaign-what-a-duck-has-to-do.jpg",  "jpeg")]:
    f = ROOT / "assets" / fname
    if f.exists():
        assets[key] = f"data:image/{mime};base64," + base64.b64encode(f.read_bytes()).decode()
    else:
        assets[key] = ""
        print(f"  ! missing {fname} — that image slot is left empty")

# the nine signatures, in the order the about block already lists them
m = re.search(r'<div id="about-signatures">(.*?)</div>', html, flags=re.S)
must(m, "could not find #about-signatures")
sigs = re.findall(r'src="(data:image/[^"]+)"\s+alt="([^"]+)"', m.group(1))
must(len(sigs) == 9, f"expected 9 signatures, found {len(sigs)}")

# ---- the photoshoot: lifestyle drives flipoff.exe, studio drives Shop.exe
PS = ROOT / "assets" / "photoshoot"
must(PS.is_dir(), "assets/photoshoot missing — run the photoshoot resize step first")

def datauri(path, mime="jpeg"):
    return f"data:image/{mime};base64," + base64.b64encode(path.read_bytes()).decode()

hero_files = sorted(PS.glob("hero-*.jpg"))
shop_files = sorted(PS.glob("shop-*.jpg"))
must(hero_files, "no hero-*.jpg in assets/photoshoot")
must(shop_files, "no shop-*.jpg in assets/photoshoot")
hero_uris = [datauri(f) for f in hero_files]
shop_js = ("  /* Shop.exe product gallery — studio shots, ordered so the\n"
           "     background colours alternate (blue / red / blue / yellow ...) */\n"
           "  const SHOP_PHOTOS = [\n"
           + "".join(f'    "{datauri(f)}",\n' for f in shop_files)
           + "  ];\n")
print(f"  embedded {len(hero_files)} lifestyle + {len(shop_files)} studio photos")

# ---- real event photos for Memories (build/make_memory_assets.py)
MEMDIR = ROOT / "assets" / "memories"
must(MEMDIR.is_dir(), "assets/memories missing — run build/make_memory_assets.py")
mem_files = sorted(MEMDIR.glob("*.jpg"))
must(mem_files, "no photos in assets/memories")
def memkey(p):
    a, b = p.stem.rsplit("-", 1)
    return a.replace("-", "") + b
mem_js = ("  /* Memories — real event photos, only from events that have happened */\n"
          "  const MEM = {\n"
          + "".join(f'    {memkey(f)}: "{datauri(f)}",\n' for f in mem_files)
          + "  };\n")
print(f"  embedded {len(mem_files)} memory photos")

# the whole handset, with only the screen made bigger (build/expand_screen.py).
# An earlier attempt cropped the number keys off to buy height -- it worked on
# paper and looked wrong: a stubby phone. The window is what needed to grow,
# not the phone to shrink.
phone_f = ROOT / "assets" / "flipphone_bigscreen.png"
must(phone_f.exists(),
     "assets/flipphone_bigscreen.png missing - run: python3 build/expand_screen.py")
flipphone_uri = datauri(phone_f, "png")

duck_f = ROOT / "assets" / "duck-walk.gif"
must(duck_f.exists(), "assets/duck-walk.gif missing")
duck_uri = datauri(duck_f, "gif")

assets["flipphone"] = flipphone_uri

# ---- the d-pad arrows: Marco's chevron, trimmed and rotated four ways by
# build/make_dpad_arrows.py. Inlined here rather than referenced, same as every
# other asset, because the prototype has to work from a single file.
for _d in ("up", "right", "down", "left"):
    _f = ROOT / "assets" / f"dpad-{_d}.png"
    must(_f.exists(), f"assets/dpad-{_d}.png missing - run: python3 build/make_dpad_arrows.py")
    assets[f"dpad_{_d}"] = datauri(_f, "png")

asset_js = ("  const A = {\n"
            + "".join(f'    {k}: "{v}",\n' for k, v in assets.items())
            + "    signatures: [\n"
            + "".join('      {name: %s, src: "%s"},\n' % (json.dumps(n), d) for d, n in sigs)
            + "    ],\n  };\n")

# ---- press: mirror the live page's own data + images (see make_press_assets.py)
PRESSDIR = ROOT / "assets" / "press"
mf = PRESSDIR / "manifest.json"
must(mf.exists(), "assets/press/manifest.json missing — run build/make_press_assets.py first")
press = json.loads(mf.read_text(encoding="utf-8"))
rows = []
for p in press:
    b64 = base64.b64encode((PRESSDIR / p["file"]).read_bytes()).decode()
    rows.append(
        '    {title:%s, source:%s, href:%s, img:"data:image/webp;base64,%s"},\n'
        % (json.dumps(p["title"]), json.dumps(p["source"]), json.dumps(p["href"]), b64)
    )
press_js = "  /* mirrors ../dumb.co/src/Press/press_data.md — %d items */\n  const PRESS_MIRROR = [\n%s  ];\n" % (
    len(press), "".join(rows))
print(f"  embedded {len(press)} press items")

# --- the team portraits are 1-bit dithered PNGs with a lot of transparent
# padding, which made them sit tiny inside the flip phone's screen. Trim each
# to its alpha bounding box so the face actually fills the screen.
from PIL import Image
import io
m = re.search(r'  const teamMembers = \[.*?\n  \];', html, flags=re.S)
must(m, "could not find teamMembers")
block = m.group(0)
uris = re.findall(r'data:image/png;base64,([A-Za-z0-9+/=]+)', block)
must(len(uris) >= 7, f"expected 7 team portraits, found {len(uris)}")
new_block, trimmed, saved = block, 0, 0
for b64 in uris:
    raw = base64.b64decode(b64)
    im = Image.open(io.BytesIO(raw)).convert("RGBA")
    bbox = im.split()[3].getbbox()
    if not bbox:
        continue
    im = im.crop(bbox)
    if im.width > 200:
        im = im.resize((200, round(im.height * 200 / im.width)), Image.NEAREST)
    # they are black dither on transparent, so a 2-colour palette with a
    # transparent index is both faithful and far smaller than RGBA
    alpha = im.split()[3]
    flat = alpha.point(lambda a: 1 if a > 120 else 0, mode="P")
    flat.putpalette([255, 255, 255, 0, 0, 0])
    buf = io.BytesIO()
    flat.save(buf, "PNG", optimize=True, transparency=0, bits=1)
    new_block = new_block.replace(b64, base64.b64encode(buf.getvalue()).decode(), 1)
    trimmed += 1
    saved += len(raw) - buf.tell()
html = html.replace(block, new_block, 1)
print(f"  trimmed {trimmed} team portraits to their alpha bbox ({saved/1024:.0f} KB smaller)")

# --------------------------------------------- 2. gi photos -> A references
for key, alt in [("people1", "friends getting ice cream"),
                 ("people2", "friends looking at the skyline, no phone zone")]:
    old = f'src="{assets[key]}" alt="{alt}"'
    new = 'src="${A.' + key + '}" alt="' + alt + '"'
    must(old in html, f"gi photo swap failed for {alt}")
    html = html.replace(old, new)

# --- the resize corners lose their drawn dashes but keep working: same hit
# area and cursor, just no visible line art
for corner, gradient in [("br", "135deg"), ("bl", "225deg")]:
    side = "right" if corner == "br" else "left"
    cur  = "nwse" if corner == "br" else "nesw"
    old_h = (f"    {side}:2px; cursor:{cur}-resize;\n"
             f"    background:linear-gradient({gradient}, transparent 0 55%, rgba(255,255,255,.7) 55% 60%,"
             " transparent 60% 70%, rgba(255,255,255,.7) 70% 75%, transparent 75%);")
    must(old_h in html, f"could not find the {corner} resize handle art")
    html = html.replace(old_h, f"    {side}:2px; cursor:{cur}-resize;\n    background:none;", 1)

# --- scope v6's carousel-image rule so it stops hitting every <img> in the window
# (it filled the whole body with `position:absolute; inset:0; width/height:100%`,
#  which blew up the press thumbnails and the user/review cards)
old_img_rule = """  #winmodal .wm-body img{
    position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block;
  }"""
must(old_img_rule in html, "could not find the v6 .wm-body img rule to scope")
html = html.replace(old_img_rule, """  #winmodal #wm-carousel img{
    position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block;
  }""", 1)

# --- drop CSS for the classes v9 removes (dev-note banners, product flags,
# the old video essay note) so nothing dangles
for dead in [".faq-dev-note", ".pc-flag", ".faq-video-note"]:
    pat = re.compile(r"\n  " + re.escape(dead) + r"[^{]*\{[^}]*\}(\n  " + re.escape(dead) + r"[^{]*\{[^}]*\})*", re.S)
    html, n = pat.subn("", html)
    must(n >= 1, f"could not find CSS rule for {dead}")

# --- the crossed-out social icons: pink X -> black X
# each icon is an inline data:image/svg+xml;base64 blob whose X strokes are
# #FF69B4, so decode, recolour, re-encode
import base64 as _b64
sv = re.findall(r'data:image/svg\+xml;base64,([A-Za-z0-9+/=]+)', html)
must(sv, "no inline svg icons found")
recoloured = 0
for blob in set(sv):
    try:
        raw = _b64.b64decode(blob).decode("utf-8")
    except Exception:
        continue
    if "#FF69B4" not in raw:
        continue
    new = raw.replace("#FF69B4", "#000000")
    html = html.replace(blob, _b64.b64encode(new.encode("utf-8")).decode())
    recoloured += 1
must(recoloured >= 3, f"expected to recolour 3 anti-social icons, did {recoloured}")
print(f"  recoloured {recoloured} anti-social X marks pink -> black")

# --- flipoff.exe opens in the same column the sections use, so the hero copy
# is never covered by the default window position
old_win = """    position:absolute; width:min(760px,44vw); height:min(680px,80vh); top:6%; left:48%; z-index:45;"""
must(old_win in html, "could not find the #winmodal geometry")
html = html.replace(old_win,
    """    position:absolute; width:min(940px,50vw); height:min(760px,84vh); top:8%; left:47%; z-index:45;""", 1)

# --- about.exe should fit its window rather than force a scrollbar: the pink
# panel was min-height:100vh, which is taller than the window it sits in
old_pink = "  #about-pink{background:var(--hotpink); min-height:100vh; padding:80px 60px 60px; display:flex; flex-direction:column;}"
must(old_pink in html, "could not find the #about-pink rule")
html = html.replace(old_pink,
    "  #about-pink{background:var(--hotpink); min-height:100%; padding:56px 60px 48px; display:flex; flex-direction:column;}", 1)

# ------------------------------------------------------------------- 3. CSS
css = (part("01_wm.css") + part("02_shop.css") + part("03_memories.css")
       + part("09_press.css") + part("12_involved.css") + part("18_quiz.css")
       + part("19_duck.css") + part("22_snake.css")
       + part("28_keys.css") + part("29_responsive.css"))
must("</style>" in html, "no </style>")
html = html.replace("</style>", css + "</style>", 1)

# ------------------------------------------------------------------- 4. nav
# Month Offline sits fourth on the mock-up slide, where Press had been.
# Month Offline links out to the existing MO site rather than opening a pop-up.
# Same URL the current build redirects to (src/Phone/Screen.tsx).
MONTH_OFFLINE_URL = "https://offline.community"

# Shop leads, About follows (Kunal). Month Offline is no longer a top-level
# item: Afreka asked for it and Get Involved to merge into "Community", which
# houses the organizing, career and community work — so MO is a link inside
# that window now, not a tab of its own.
NAV_ITEMS = [
    # key, label, external href, url slug
    ("shop",      "Shop",      None, "shop"),
    ("about",     "About",     None, "about"),
    ("community", "Community", None, "community"),
    ("press",     "Press",     None, "press"),
    ("memories",  "Memories",  None, "memories"),
    ("faq",       "FAQ",       None, "faq"),
    ("contact",   "Contact",   None, "contact"),
]

# Every section is addressable, so a section can be linked, copy-pasted and
# bookmarked (Jack's note). A static prototype can't answer a pushState path
# like /shop on reload — it would 404 the moment someone pasted it — so the
# prototype carries the slug in the hash (index.html#/shop) and ROUTES below is
# the exact map react-router should use when this is ported (dumb.co/shop).
def nav_html(indent, count_badge):
    out = []
    for key, label, href, slug in NAV_ITEMS:
        if href:
            out.append(f'{indent}<a class="navitem external" data-key="{key}" href="{href}" '
                       f'target="_blank" rel="noopener noreferrer" '
                       f'title="opens the existing Month Offline site">{label}</a>')
        else:
            out.append(f'{indent}<a class="navitem" data-key="{key}" data-slug="{slug}" '
                       f'href="#/{slug}">{label}</a>')
    return "\n".join(out)

html, n = re.subn(r'      <nav id="navlist">.*?\n      </nav>',
                  lambda m: '      <nav id="navlist">\n' + nav_html("        ", True) + "\n      </nav>",
                  html, count=1, flags=re.S)
must(n == 1, "sidebar nav replace failed")

html, n = re.subn(r'      <div id="topbar-nav">.*?\n      </div>',
                  lambda m: '      <div id="topbar-nav">\n' + nav_html("        ", False) + "\n      </div>",
                  html, count=1, flags=re.S)
must(n == 1, "topbar nav replace failed")

# ------------------------------------------------ 5. (no desktop duck)
# The duck was v6's top-bar mascot. v8 removed the top bar, and putting it on
# the desktop was my call, not Kunal's notes or the deck — so it stays in the
# hidden top bar rather than sitting in the bottom-right corner facing the edge.

# --- the flipoff.exe carousel (and the Memories tiles that reuse it) now run
# on the lifestyle photoshoot rather than the old stand-in crops
m = re.search(r'  const carouselImgs = \[.*?\];\n', html, flags=re.S)
must(m, "could not find the carouselImgs array")
html = html.replace(m.group(0),
    "  const carouselImgs = [\n" + "".join(f'    "{u}",\n' for u in hero_uris) + "  ];\n", 1)

# ------------------- 6. one window: carousel view + section view in one body
m = re.search(r'      <div class="wm-body" id="wm-body">\n(.*?)\n      </div>\n      <div class="wm-resize',
              html, flags=re.S)
must(m, "could not find the #wm-body block")
html = html.replace(m.group(0),
    '      <div class="wm-body" id="wm-body">\n'
    '        <div id="wm-carousel">\n' + m.group(1) + "\n        </div>\n"
    '        <div id="wm-section"></div>\n'
    "      </div>\n      <div class=\"wm-resize", 1)

# the old full-page section container is dead in v8
html, n = re.subn(r'    <div id="section-body">.*?\n    </div></div>\n', "", html, count=1, flags=re.S)
must(n == 1, "could not remove the old #section-body markup")

# --------------------------------------------------- 6b. the walking duck
# It lives on the desktop but only shows while the window is collapsed into
# the egg, walking between the logo and the egg.
deskphone = (
    '    <!-- the flip phone lives on the desktop behind the .exe window; shrink\n'
    '         the window into the egg and this is what is left (and it plays snake) -->\n'
    '    <div id="deskphone">\n'
    '      <div class="phone-frame">\n'
    '        <div class="pf-screen" id="tcl-screen"></div>\n'
    f'        <img class="pf-art" src="{flipphone_uri}" alt="dumbphone 2" />\n'
    '        <div class="pf-keys">\n'
    "          <button type=\"button\" class=\"k-up\"    aria-label=\"up\"    onclick=\"teamKey('up')\">&#8593;</button>\n"
    "          <button type=\"button\" class=\"k-left\"  aria-label=\"left\"  onclick=\"teamKey('left')\">&#8592;</button>\n"
    "          <button type=\"button\" class=\"k-right\" aria-label=\"right\" onclick=\"teamKey('right')\">&#8594;</button>\n"
    "          <button type=\"button\" class=\"k-down\"  aria-label=\"down\"  onclick=\"teamKey('down')\">&#8595;</button>\n"
        "          <button type=\"button\" class=\"k-ok\"    aria-label=\"select\" onclick=\"phoneOk()\">OK</button>\n"
    '        </div>\n'
    '      </div>\n'
    '    </div>\n'
)
html = html.replace('    <div id="egg"',
                    deskphone + f'    <div id="walkduck"><img src="{duck_uri}" alt="dumb.co duck"/></div>\n    <div id="egg"', 1)
must('id="deskphone"' in html, "deskphone insert failed")
must('id="walkduck"' in html, "walkduck markup insert failed")

old_pop = "      egg.addEventListener('animationend', ()=> egg.classList.remove('pop'), {once:true});"
must(old_pop in html, "could not find the egg pop handler")
html = html.replace(old_pop, old_pop + "\n      startDuckWalk();", 1)

old_expand = """  function expandModal(){
    document.getElementById('egg').classList.remove('show', 'pop');"""
must(old_expand in html, "could not find expandModal")
html = html.replace(old_expand, """  function expandModal(){
    stopDuckWalk();
    document.getElementById('egg').classList.remove('show', 'pop');""", 1)

# ------------------------------------------------- 7. section bodies
html = swap_block(html, "    shop: () => `",     "    involved: () => `", part("06_shop_section.js"))
html = swap_block(html, "    memories: () => `", "    faq: () => `",      part("07_memories_section.js"))
html = swap_block(html, "    press: () => `",    "    memories: () => `", part("10_press_section.js"))
html = swap_block(html, "    involved: () => `", "    press: () => `",    part("11_involved_section.js"))
# (that part now emits `community: () => ...` — the file keeps its old name)
html = swap_block(html, "    about: () => `",    "    shop: () => `",     part("15_about_section.js"))
html = swap_block(html, "    faq: () => `",      "    contact: () => `",  part("16_faq_section.js"))
html = swap_block(html, "    contact: () => `",  "  };\n\n",             part("14_contact_section.js"))

# clean FAQ javascript (drops the CORS/GitHub/Vimeo-watermark essays) and adds
# the two new Phone Demo videos
html = swap_block(html, "  async function loadFaq(){", "  function toggleFaq(idx){", part("17_faq.js") + "\n")

# the baseline's setTeamPhoto queried ".tcl-screen img" (a class) against an
# element that only has id="tcl-screen", so it never cleared the previous photo.
# 08_helpers.js defines a working one; drop the broken original.
old_stp = re.search(r'  function setTeamPhoto\(i\)\{.*?\n  \}\n', html, flags=re.S)
must(old_stp, "could not find the baseline setTeamPhoto")
html = html.replace(old_stp.group(0), "", 1)

# ------------------------------------------- 8. data + window controller
must("  const sections = {" in html, "sections object not found")
routes_js = ("  /* section <-> url slug. The prototype uses #/<slug>; the React port maps\n"
             "     the same slugs to real paths (dumb.co/shop, dumb.co/get_involved). */\n"
             "  const ROUTES = " + json.dumps({k: slug for k, _l, href, slug in NAV_ITEMS if not href},
                                              indent=4).replace("\n", "\n  ") + ";\n\n")
# ---- the FAQ sheet, snapshotted at build time so FAQ.exe always has content
# (Google's published-CSV endpoint has no CORS header on its final hop, and a
# file:// page has a null origin, so the live fetch cannot be relied on)
import csv as _csv, io as _io
FAQ_SNAP = ROOT / "assets" / "faq_snapshot.csv"
must(FAQ_SNAP.exists(), "assets/faq_snapshot.csv missing — run build/refresh_faq_snapshot.py")
_faq_rows = list(_csv.reader(_io.StringIO(FAQ_SNAP.read_text(encoding="utf-8"))))
_faq_qs = [r for r in _faq_rows[1:] if r and r[0].strip()]
must(len(_faq_qs) >= 5, f"the FAQ snapshot only has {len(_faq_qs)} questions")
faq_js = ("  /* the FAQ sheet as of the last build (build/refresh_faq_snapshot.py).\n"
          "     FAQ.exe shows this instantly, then upgrades to the live sheet if the\n"
          "     fetch succeeds. %d questions. */\n" % len(_faq_qs)
          + "  const FAQ_SNAPSHOT = " + json.dumps(_faq_rows) + ";\n\n")

# ---- the reviews sheet as of the last build (build/refresh_reviews_snapshot.py)
_rev_f = ROOT / "assets" / "reviews_snapshot.csv"
must(_rev_f.exists(), "assets/reviews_snapshot.csv missing")
_rev_rows = list(_csv.reader(_io.StringIO(_rev_f.read_text(encoding="utf-8"))))
must(len(_rev_rows) > 1, "reviews_snapshot.csv has no review rows")
_rev_shown = [r for r in _rev_rows[1:] if r and any(c.strip() for c in r)]
rev_js = ("  /* the reviews sheet as of the last build "
          "(build/refresh_reviews_snapshot.py).\n"
          "     The shop page shows this instantly, then upgrades to the live sheet\n"
          "     if REVIEWS_CSV_URL is set and the fetch succeeds. %d reviews. */\n" % len(_rev_shown)
          + "  const REVIEWS_SNAPSHOT = " + json.dumps(_rev_rows) + ";\n\n")

html = html.replace("  const sections = {",
                    asset_js + press_js + shop_js + mem_js + faq_js + rev_js + part("05_data.js") + routes_js
                    + "\n  const sections = {", 1)

html = swap_block(html, "  function openSection(key){", "  /* ---------------- live FAQ",
                  part("04_wm.js") + part("08_helpers.js") + part("20_duck.js")
                  + part("21_snake.js") + part("23_memories_sheet.js") + part("31_reviews.js")
                  + part("24_routes.js") + part("27_keys.js") + part("30_phone.js") + "\n")

# ---- 8b. the hero kicker used to gain "$20 phone - plans from $15.99/mo"
# here. Milk + Marlee: no price on the home page at all. The shop page carries
# it, and leading with a number before anyone knows what the thing is prices it
# against phones it isn't competing with. The baseline now reads just
# "dumbphone 2" and nothing rewrites it.
must('<div class="kicker">dumbphone 2</div>' in html,
     "the hero kicker changed shape - check it still says just the product name")

# ---- fill the d-pad arrow tokens in 22_snake.css
for _d in ("up", "right", "down", "left"):
    _tok = "__DPAD_%s__" % _d.upper()
    must(_tok in html, f"{_tok} not found - did 22_snake.css change?")
    html = html.replace(_tok, assets[f"dpad_{_d}"])

# ------------------------------------------------------------------ 9. title
html = html.replace("<title>dumb.co — 2026 redesign concept v3</title>",
                    "<title>dumb.co — 2026 redesign concept v8</title>", 1)
# no version number in the footer label — it only ever goes stale
html = re.sub(r"dumb\.co 2026 redesign( v\d+)? — not final copy",
              "dumb.co 2026 redesign — not final copy", html, count=1)

# ----------------------------------------------------------------- 10. checks
for needle in ['id="wm-section"', 'id="wm-carousel"', "const EXE",
               'id="walkduck"', "startDuckWalk();",
               "4 month minimum", "SHOW_PLAN_CARDS", "MEMORY_EVENTS",
               "PRESS_MIRROR", "press-mirror", "railStep", "$15.99",
               "xtra&#8209;ordinary", "community: () =>",
               'href="#/community"', "const ROUTES", "function applyRoute", "SLUG_TO_KEY",
               ">Community<", "gi-drop", f'href="{MONTH_OFFLINE_URL}"',
               "1209576549", "1215826540",
               "about-team", 'onclick="openQuiz()"', "signatures: [",
               "Find out what plan works for you", "plan-table", "const SPLIT", "camp1:", "camp3:", "clamp(38px, 3.5vw, 66px)",
               # photoshoot, the flip-phone illustration and snake
               "SHOP_PHOTOS", "sh-gallery", 'class="pf-screen"', "flipphone:",
               "SNAKE_SEQUENCE", 'class="pf-keys"', "function snakeTick", "teamKey(",
               "duckWalkPath", 'id="tcl-screen"', 'id="deskphone"', "phonePlayable",
               "const MEM = {", "Month Offline gallery", "DC Pride", "const DOT_SIZE",
               "MEMORIES_CSV_URL", "function memoriesFromRows", "loadMemories();",
               "const FAQ_SNAPSHOT", "function faqItemsFromRows",
               "const REVIEWS_SNAPSHOT", "function reviewsFromRows", "loadReviews",
               "function keyboardNav", "kbfocus", "function buildPhoneMenu", "pm-row",
               "function phoneFit", "k-ok", "--bp-phone",
               "gi-foot",
               'src="quiz.html"', 'class="qf-frame"', "renderAllPlans()"]:
    must(needle in html, f"post-build check failed, missing: {needle}")
for banned in ["body.classList.add('section-open')", 'class="xwin', "createWindow", 'id="taskbar"',
               'id="section-body"', "openMonthOffline(", "$20/mo</div>",
               'class="devnote', 'class="faq-dev-note', 'class="pc-flag',
               "who's on one", "also dumb", "const USERS",
               'id="desk-duck', 'class="faq-video-note',
               "SHOW_QUIZ", "content needed:", "on hiding Vimeo's branding",
               "const QUIZ =", "function renderQuiz(", "quizAnswer(",
               "NYFW activation", "Hush Harbor", "dumb organizers",
               "a.navitem.external::after", 'class="count"', "function mobileHint", 'id="mobhint"',
               ">Get Involved<", 'data-key="monthoffline"', ">Month Offline</a>",
               "that's a sandbox thing", "compare all three plans", "not sure which plan fits",
               ">compare plans<"]:
    must(banned not in html, f"v7 leftover still present: {banned}")
must(html.count("data:image/webp;base64") >= len(press), "press thumbnails not all embedded")

OUT.write_text(html, encoding="utf-8")
print(f"  wrote {OUT.relative_to(ROOT)}  ({len(html):,} chars, {html.count(chr(10)):,} lines)")
