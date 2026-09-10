#!/usr/bin/env python3
"""
Builds the two mobile prototypes into concept/, from the same sources as the
desktop concept. Run build.py first — version B is derived from its output.

  concept/mobile-new.html      version B: the 2026 redesign on a phone.
                               concept/index.html + m01_mobile.css + m02_mobile.js.
                               Same data and same section bodies as the desktop
                               concept, so it cannot drift from it.

  concept/mobile-current.html  version A: a standalone mirror of the site that
                               is live today (the phone keypad UI), with a
                               memories section added. Built from
                               m10_current.html + assets inlined here.

Neither file touches dumb.co/ — nothing here writes outside this folder.
"""
import base64, io, json, pathlib, re, sys

ROOT  = pathlib.Path(__file__).resolve().parent.parent

def find_live_app(start):
    """The React app this prototype mirrors.

    Works whether this folder sits beside the app (dumb.co_code/dumb.co_redesign_2026)
    or inside it on a branch (dumb.co/redesign_2026), so the same scripts run in
    both places.
    """
    for cand in (start.parent, start.parent / "dumb.co", start.parent.parent / "dumb.co"):
        if (cand / "package.json").is_file() and (cand / "src").is_dir():
            return cand
    raise SystemExit("can't find the dumb.co app (looked for package.json + src/ "
                     f"beside and above {start})")
LIVE  = find_live_app(ROOT)              # read-only: assets + press data
PARTS = ROOT / "build" / "parts"

def must(cond, msg):
    if not cond:
        sys.exit(f"build_mobile: {msg}")

def part(name):
    p = PARTS / name
    must(p.exists(), f"missing part {name}")
    return p.read_text(encoding="utf-8")

# ---------------------------------------------------------------------------
# B — the redesign on a phone: index.html + the mobile shell
# ---------------------------------------------------------------------------
def build_new():
    src = ROOT / "concept" / "index.html"
    must(src.exists(), "concept/index.html missing — run build/build.py first")
    html = src.read_text(encoding="utf-8")

    must("</style>" in html, "no </style> in index.html")
    html = html.replace("</style>", part("m01_mobile.css") + "</style>", 1)

    must("</script>" in html, "no </script> in index.html")
    i = html.rindex("</script>")
    html = html[:i] + part("m02_mobile.js") + html[i:]

    html = html.replace("<title>dumb.co — 2026 redesign concept v8</title>",
                        "<title>dumb.co — 2026 redesign, mobile</title>", 1)

    for needle in ["stage.id = 'mstage'", "function mobileClose", "#mmenu .mm-row",
                   "mobileClose()", "function mFit", "function mSelect", "const M_ART",
                   "MEMORY_EVENTS", "SHOP_PHOTOS", 'src="quiz.html"', "ROUTES",
                   "mhelp-badge", "const M_FIT", "d&#8209;pad on screen"]:
        must(needle in html, f"mobile-new check failed, missing: {needle}")

    out = ROOT / "concept" / "mobile-new.html"
    out.write_text(html, encoding="utf-8")
    print(f"  wrote concept/{out.name}  ({len(html):,} chars)")

    # ---- the same page, phone scaled up until the D-pad reaches the bottom.
    # An alternate for the review, in case the menu on mobile-new.html reads
    # too small: the flag is set before the page script runs, and mFit() sizes
    # the phone off the D-pad instead of the whole handset, cropping the number
    # keys off below.
    flag = ('<script>/* alt sizing: bigger phone, number keys crop off the bottom */\n'
            "window.DUMB_MOBILE_FIT = 'dpad';</script>\n")
    must("<body>" in html, "no <body> to set the sizing flag before")
    big = html.replace("<body>", "<body>\n" + flag, 1)
    big = big.replace("<title>dumb.co — 2026 redesign, mobile</title>",
                      "<title>dumb.co — 2026 redesign, mobile (bigger phone)</title>", 1)
    must("window.DUMB_MOBILE_FIT" in big, "sizing flag not injected")

    out_big = ROOT / "concept" / "mobile-new-big.html"
    out_big.write_text(big, encoding="utf-8")
    print(f"  wrote concept/{out_big.name}  ({len(big):,} chars, D-pad-height sizing)")

# ---------------------------------------------------------------------------
# A — a mirror of the site that is live today, plus memories
# ---------------------------------------------------------------------------
def datauri(raw: bytes, mime: str) -> str:
    return f"data:{mime};base64," + base64.b64encode(raw).decode()

def build_current():
    from PIL import Image, ImageOps

    def webp(path, width, q=72):
        im = Image.open(path)
        im = ImageOps.exif_transpose(im).convert("RGB")
        if im.width > width:
            im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
        buf = io.BytesIO(); im.save(buf, "WEBP", quality=q, method=6)
        return datauri(buf.getvalue(), "image/webp")

    # the live site's own logo + crossed-out social icons
    logo_f = LIVE / "public" / "img" / "dumbco.png"
    must(logo_f.exists(), "dumb.co/public/img/dumbco.png missing")
    im = Image.open(logo_f).convert("RGBA")
    h = 120
    im = im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, "WEBP", quality=88, method=6)
    logo_uri = datauri(buf.getvalue(), "image/webp")

    ns_dir = LIVE / "public" / "img" / "anti-socials"
    ns = {}
    for name in ("instagram", "x", "facebook"):
        f = ns_dir / f"anti-social-{name}.svg"
        must(f.exists(), f"missing {f.name}")
        # kept exactly as the live site draws them: white glyph, pink cross,
        # which is what they look like on the dark phone body today
        ns[name] = datauri(f.read_bytes(), "image/svg+xml")

    # the team portraits are 1-bit dithered PNGs with transparency; keep the
    # alpha so they read as black-on-olive inside the screen, like the live site
    portraits = {}
    for label, fname in [("Daniel Hogenkamp", "Danny.png"),
                         ("Jack Nugent", "JackN.png"),
                         ("Lydia Peabody", "Lydia.png"),
                         ("Milk DiDonato", "pixel_milk.png"),
                         ("Afreka Ebanks", "pixel_afreka.png")]:
        f = LIVE / "public" / "img" / fname
        must(f.exists(), f"missing portrait {fname}")
        im = Image.open(f).convert("RGBA")
        w = 260
        if im.width > w:
            im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        buf = io.BytesIO()
        im.quantize(colors=16, method=Image.FASTOCTREE).save(buf, "PNG", optimize=True)
        portraits[label] = datauri(buf.getvalue(), "image/png")

    # memories: the same event photos the redesign uses, screen-sized
    memdir = ROOT / "assets" / "memories"
    must(memdir.is_dir(), "assets/memories missing — run build/make_memory_assets.py")
    mem = {p.stem: webp(p, 380) for p in sorted(memdir.glob("*.jpg"))}
    must(mem, "no photos in assets/memories")

    events = [
        {"name": "baird x dumb.co", "when": "date TBC",
         "shots": [], "note": "photos coming soon"},
        {"name": "Month Offline gallery", "when": "Aug 2026",
         "shots": [{"k": "mo-1", "cap": "opening night"},
                   {"k": "mo-2", "cap": "the wall of entries"},
                   {"k": "mo-3", "cap": "prints + plants"},
                   {"k": "mo-4", "cap": "LOST? CALL 207-806-0033"},
                   {"k": "mo-5", "cap": "on the decks"}]},
        {"name": "DC Pride", "when": "Jun 2026",
         "shots": [{"k": "pride-1", "cap": "join the flip side"},
                   {"k": "pride-2", "cap": "the tote"},
                   {"k": "pride-3", "cap": "down the parade route"},
                   {"k": "pride-4", "cap": "bubbles"},
                   {"k": "pride-5", "cap": "dumb.co fans"},
                   {"k": "pride-6", "cap": "parade weather"}]},
    ]
    for ev in events:
        for s in ev["shots"]:
            must(s["k"] in mem, f"memory photo {s['k']} not in assets/memories")
            s["src"] = mem[s["k"]]
            del s["k"]

    html = part("m10_current.html")
    html = (html
            .replace("{{LOGO}}", logo_uri)
            .replace("{{NS_INSTAGRAM}}", ns["instagram"])
            .replace("{{NS_X}}", ns["x"])
            .replace("{{NS_FACEBOOK}}", ns["facebook"])
            .replace("{{EVENTS_JSON}}", json.dumps(events))
            .replace("{{PORTRAITS_JSON}}", json.dumps(portraits)))
    must("{{" not in html, "an m10_current.html placeholder was left unfilled")

    out = ROOT / "concept" / "mobile-current.html"
    out.write_text(html, encoding="utf-8")
    print(f"  wrote concept/{out.name}  ({len(html):,} chars, {len(events)} memory events)")

if __name__ == "__main__":
    build_current()
    build_new()
