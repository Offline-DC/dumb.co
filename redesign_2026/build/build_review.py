#!/usr/bin/env python3
"""
Builds ONE file to send the team: concept/dumb.co-review.html

The whole prototype in a single document. It is responsive — narrow the window
(or open it on a phone) for the phone layout. Nothing is fetched at runtime, so
it works from a Downloads folder with the wifi off:

  fonts     Rubik is @import-ed from Google Fonts in the normal build; here the
            four weights are inlined as woff2 (Cheltenham already was)
  quiz      quiz.exe frames concept/quiz.html; here the whole quiz rides along
            as a JSON string and is written into the iframe's srcdoc
  FAQ       already served from the build-time snapshot (17_faq.js)
  memories  already inlined photos
  video     the Vimeo tiles need the internet; offline they say so

The switcher reloads the same file with ?view=phone / ?view=phone-big, and the
mobile shell only runs for those. Run build.py and build_mobile.py first.
"""
import base64, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

def find_live_app(start):
    for cand in (start.parent, start.parent / "dumb.co", start.parent.parent / "dumb.co"):
        if (cand / "package.json").is_file() and (cand / "src").is_dir():
            return cand
    raise SystemExit("can't find the dumb.co app")

LIVE = find_live_app(ROOT)

def must(cond, msg):
    if not cond:
        sys.exit(f"build_review: {msg}")

def part(name):
    p = ROOT / "build" / "parts" / name
    must(p.exists(), f"missing part {name}")
    return p.read_text(encoding="utf-8")

SRC = ROOT / "concept" / "index.html"
must(SRC.exists(), "concept/index.html missing — run build/build.py first")
html = SRC.read_text(encoding="utf-8")

# ---------------------------------------------------------------- 1. fonts
# the four weights live in this folder rather than the app's node_modules, so
# the review build works from a fresh checkout (and inside a git worktree)
FONT_DIR = ROOT / "assets" / "fonts"
if not FONT_DIR.is_dir():
    FONT_DIR = LIVE / "node_modules" / "@fontsource" / "rubik" / "files"
must(FONT_DIR.is_dir(), "no Rubik woff2 in assets/fonts (or the app's node_modules)")
faces = []
for weight in (400, 500, 700, 800):
    f = FONT_DIR / f"rubik-latin-{weight}-normal.woff2"
    must(f.exists(), f"missing {f.name}")
    uri = "data:font/woff2;base64," + base64.b64encode(f.read_bytes()).decode()
    faces.append(
        "  @font-face{font-family:'Rubik';font-style:normal;font-weight:%d;"
        "font-display:swap;src:url(%s) format('woff2');}\n" % (weight, uri)
    )
imports = re.findall(r"\s*@import url\('https://fonts\.googleapis\.com[^)]*\);", html)
must(imports, "no Google Fonts @import found — has the baseline changed?")
html = html.replace(imports[0], "\n  /* Rubik inlined so this file needs no network */\n" + "".join(faces), 1)
must("fonts.googleapis.com" not in html, "a Google Fonts reference is still in the file")

# ----------------------------------------------------------------- 2. quiz
QUIZ = ROOT / "concept" / "quiz.html"
must(QUIZ.exists(), "concept/quiz.html missing — run build/build.py first")
quiz_json = json.dumps(QUIZ.read_text(encoding="utf-8")).replace("</script", "<\\/script")
must('src="quiz.html"' in html, "could not find the quiz iframe")
html = html.replace('src="quiz.html"', 'src="about:blank" onload="reviewQuizFrame(this)"', 1)

# ------------------------------------------- 3. offline nicety + a label
# No view switcher any more: concept/index.html is responsive, so the phone
# layout is "make the window narrow" (or open it on a phone), not a second
# document to toggle to.
view_js = """
  /* the two Vimeo tiles are the only thing here that wants the internet */
  (function reviewOffline(){
    function reviewQuizFrameInit(){}
    if(navigator.onLine === false){
      const swap = () => document.querySelectorAll('iframe[src*="player.vimeo.com"]').forEach(f => {
        const note = document.createElement('div');
        note.className = 'rv-novideo';
        note.textContent = 'video needs internet';
        f.replaceWith(note);
      });
      swap();
      new MutationObserver(swap).observe(document.body, {childList:true, subtree:true});
    }
  })();

  function reviewQuizFrame(f){
    if(f.dataset.q) return;
    f.dataset.q = '1';
    f.srcdoc = REVIEW_QUIZ;
  }
"""

view_css = """
  /* ==========================================================================
     REVIEW BUILD
     ========================================================================== */
  .rv-novideo{
    display:flex; align-items:center; justify-content:center; min-height:120px;
    background:var(--fill, #f2f2f1); border:1px dashed rgba(0,0,0,.3);
    font-family:var(--body); font-weight:700; font-size:12px; color:#666;
  }
"""

must("</style>" in html, "no </style>")
html = html.replace("</style>", view_css + "</style>", 1)

must("</script>" in html, "no </script>")
i = html.rindex("</script>")
html = (html[:i]
        + "\n  const REVIEW_QUIZ = " + quiz_json + ";\n"
        + view_js
        + html[i:])

html = html.replace("<title>dumb.co — 2026 redesign concept v8</title>",
                    "<title>dumb.co — 2026 redesign (review copy)</title>", 1)

# ----------------------------------------------------------------- checks
for needle in ["const REVIEW_QUIZ", "@font-face{font-family:'Rubik'", "reviewQuizFrame",
               "rv-novideo", "FAQ_SNAPSHOT", "MEMORY_EVENTS", "const ROUTES",
               "function phoneFit", "--bp-phone"]:
    must(needle in html, f"review check failed, missing: {needle}")
for banned in ["fonts.googleapis.com", 'src="quiz.html"']:
    must(banned not in html, f"still references {banned} — the file would need the network")

OUT = ROOT / "concept" / "dumb.co-review.html"
OUT.write_text(html, encoding="utf-8")
print(f"  wrote concept/{OUT.name}  ({len(html):,} chars, {len(html)/1048576:.1f} MB)")
print("  one responsive file, no network needed — narrow the window for the phone layout")
