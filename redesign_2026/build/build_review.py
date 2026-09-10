#!/usr/bin/env python3
"""
Builds ONE file to send the team: concept/dumb.co-review.html

Desktop and both phone layouts in a single document, with a switcher at the
bottom. Nothing is fetched at runtime, so it works from a Downloads folder with
the wifi off:

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
FONT_DIR = LIVE / "node_modules" / "@fontsource" / "rubik" / "files"
must(FONT_DIR.is_dir(), "@fontsource/rubik not installed in the app — run npm install there")
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

# --------------------------------------------- 3. the mobile shell, gated
mobile_css = part("m01_mobile.css")
mobile_js = part("m02_mobile.js")

# inline handlers resolve in global scope, so the two names used from markup
# have to be exported out of the wrapper
mobile_js_wrapped = (
    "  function applyMobileShell(){\n" + mobile_js
    + "\n    window.mPick = mPick;\n    window.mobileClose = mobileClose;\n  }\n"
)

view_js = """
  /* ==========================================================================
     REVIEW BUILD — one file, three views
     ?view=desktop (default) | ?view=phone | ?view=phone-big
     The phone views enable the mobile stylesheet (parked in a media="not all"
     sheet so it is parsed but inert) and run the mobile shell. Switching
     reloads the same file, which is also what makes it work from a file:// path
     with no server.
     ========================================================================== */
  function reviewView(){
    const m = /[?&]view=(phone-big|phone|desktop)/.exec(location.search);
    return m ? m[1] : 'desktop';
  }

  function reviewGo(view){
    const base = location.pathname;
    location.href = base + (view === 'desktop' ? '' : '?view=' + view) + (location.hash || '');
  }

  function reviewQuizFrame(f){
    if(f.dataset.q) return;
    f.dataset.q = '1';
    f.srcdoc = REVIEW_QUIZ;
  }

  (function reviewBar(){
    const view = reviewView();

    if(view !== 'desktop'){
      if(view === 'phone-big') window.DUMB_MOBILE_FIT = 'dpad';
      const sheet = document.getElementById('mstyle');
      if(sheet) sheet.media = 'all';
      applyMobileShell();
    }

    const bar = document.createElement('div');
    bar.id = 'rvbar';
    bar.innerHTML =
      '<span class="rv-label">dumb.co 2026 &mdash; review</span>' +
      '<button type="button" data-v="desktop">desktop</button>' +
      '<button type="button" data-v="phone">phone</button>' +
      '<button type="button" data-v="phone-big">phone, bigger</button>';
    document.body.appendChild(bar);
    bar.querySelectorAll('button').forEach(b => {
      if(b.dataset.v === view) b.classList.add('on');
      b.onclick = () => reviewGo(b.dataset.v);
    });

    /* the two Vimeo tiles are the only thing here that wants the internet */
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
"""

view_css = """
  /* ==========================================================================
     REVIEW BUILD — the view switcher
     ========================================================================== */
  #rvbar{
    position:fixed; z-index:700; left:50%; bottom:14px; transform:translateX(-50%);
    display:flex; align-items:center; gap:6px; flex-wrap:wrap; justify-content:center;
    background:var(--black); border-radius:100px; padding:7px 9px;
    box-shadow:0 6px 20px rgba(0,0,0,.34); max-width:calc(100vw - 20px);
  }
  #rvbar .rv-label{
    font-family:var(--body); font-weight:700; font-size:10.5px; letter-spacing:.06em;
    color:rgba(255,255,255,.62); text-transform:uppercase; padding:0 6px 0 4px;
  }
  #rvbar button{
    font-family:var(--body); font-weight:700; font-size:12px;
    background:transparent; color:var(--white); border:1.5px solid rgba(255,255,255,.34);
    border-radius:100px; padding:6px 13px; cursor:pointer; white-space:nowrap;
  }
  #rvbar button:hover{border-color:var(--white);}
  #rvbar button.on{background:var(--yellow); color:var(--black); border-color:var(--yellow);}
  /* it would sit over the .exe window's own controls on a phone */
  body.sheet-open #rvbar{opacity:.28;}
  body.sheet-open #rvbar:hover{opacity:1;}
  .rv-novideo{
    display:flex; align-items:center; justify-content:center; min-height:120px;
    background:var(--fill, #f2f2f1); border:1px dashed rgba(0,0,0,.3);
    font-family:var(--body); font-weight:700; font-size:12px; color:#666;
  }
"""

must("</style>" in html, "no </style>")
html = html.replace("</style>", view_css + "</style>", 1)

# the mobile stylesheet rides along inert until a phone view turns it on
must("</head>" in html, "no </head>")
html = html.replace("</head>",
                    '<style id="mstyle" media="not all">\n' + mobile_css + "</style>\n</head>", 1)

must("</script>" in html, "no </script>")
i = html.rindex("</script>")
html = (html[:i]
        + "\n  const REVIEW_QUIZ = " + quiz_json + ";\n"
        + mobile_js_wrapped
        + view_js
        + html[i:])

html = html.replace("<title>dumb.co — 2026 redesign concept v8</title>",
                    "<title>dumb.co — 2026 redesign (review copy)</title>", 1)

# ----------------------------------------------------------------- checks
for needle in ["function applyMobileShell", "const REVIEW_QUIZ", "function reviewView",
               'id="mstyle"', "bar.id = 'rvbar'", "#rvbar button", "window.mPick", "window.mobileClose",
               "@font-face{font-family:'Rubik'", "reviewQuizFrame", "rv-novideo",
               "FAQ_SNAPSHOT", "MEMORY_EVENTS", "const ROUTES"]:
    must(needle in html, f"review check failed, missing: {needle}")
for banned in ["fonts.googleapis.com", 'src="quiz.html"']:
    must(banned not in html, f"still references {banned} — the file would need the network")

OUT = ROOT / "concept" / "dumb.co-review.html"
OUT.write_text(html, encoding="utf-8")
print(f"  wrote concept/{OUT.name}  ({len(html):,} chars, {len(html)/1048576:.1f} MB)")
print("  desktop + phone + phone-big in one file, no network needed")
