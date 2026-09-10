#!/usr/bin/env python3
"""
Read-only pre-flight on ../dumb.co: does a deploy actually ship everything, and
is it inside GitHub Pages' limits?

    python3 build/check_deploy.py            # checks the repo as it stands
    npm run build && python3 build/check_deploy.py    # also diffs public/ -> dist/

Writes nothing, touches nothing. Every FAIL and WARN says what to do about it.

GitHub Pages limits (docs.github.com/en/pages > GitHub Pages limits):
  published site   1 GB
  source repo      1 GB recommended
  bandwidth        100 GB / month, soft
  build timeout    10 minutes
Git itself warns over 50 MB per file and rejects over 100 MB.
"""
import os, pathlib, re, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

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
LIVE = find_live_app(ROOT)

MB = 1024 * 1024
GB = 1024 * MB

ok_n = warn_n = fail_n = 0
def ok(msg):
    global ok_n; ok_n += 1; print(f"  \033[32mok\033[0m    {msg}")
def warn(msg, fix=""):
    global warn_n; warn_n += 1; print(f"  \033[33mwarn\033[0m  {msg}")
    if fix: print(f"        -> {fix}")
def fail(msg, fix=""):
    global fail_n; fail_n += 1; print(f"  \033[31mFAIL\033[0m  {msg}")
    if fix: print(f"        -> {fix}")

def size(p):
    try: return p.stat().st_size
    except OSError: return 0

def tree_size(d):
    return sum(size(pathlib.Path(r) / f) for r, _dd, ff in os.walk(d) for f in ff)

def human(n):
    return f"{n/GB:.2f} GB" if n >= GB else f"{n/MB:.1f} MB" if n >= MB else f"{n/1024:.0f} KB"

def git(*args):
    try:
        return subprocess.run(["git", "-C", str(LIVE), *args],
                              capture_output=True, text=True, timeout=60).stdout
    except Exception:
        return ""

print(f"\nchecking {LIVE}\n")
if not LIVE.is_dir():
    sys.exit(f"can't find {LIVE}")

# ---------------------------------------------------------------- 1. workflow
print("deploy workflow")
wf = LIVE / ".github" / "workflows" / "deploy.yml"
if not wf.exists():
    fail("no .github/workflows/deploy.yml", "nothing deploys on push")
else:
    w = wf.read_text(encoding="utf-8", errors="replace")
    ok("deploy.yml present")
    m = re.search(r"branches:\s*\[([^\]]*)\]", w)
    branches = [b.strip().strip("'\"") for b in (m.group(1).split(",") if m else [])]
    cur = (git("rev-parse", "--abbrev-ref", "HEAD") or "?").strip()
    if branches:
        ok(f"fires on push to {', '.join(branches)}")
        if cur not in branches:
            warn(f"you are on '{cur}', which does not deploy",
                 f"merge into {branches[0]} — work on '{cur}' is not live")
    m = re.search(r"cname:\s*(\S+)", w)
    if m: ok(f"custom domain set by the workflow: {m.group(1)}")
    else: warn("no cname: in the workflow", "the site would fall back to the github.io URL")
    if "404.html" in w:
        ok("404.html SPA fallback step present")
        warn("that fallback serves real paths with an HTTP 404 status",
             "see SEO.md — prerender the routes instead before shipping /shop etc.")
    else:
        warn("no 404.html step", "any path other than / would hit GitHub's own 404 page")
    if "force_orphan" in w:
        ok("force_orphan: gh-pages is replaced each deploy, so its history can't bloat")
    if re.search(r"enable_jekyll:\s*true", w):
        fail("enable_jekyll: true", "Jekyll drops files and folders starting with _")
    else:
        ok("Jekyll off (the action writes .nojekyll)")

# ------------------------------------------------------------------ 2. weight
print("\nweight")
pub = LIVE / "public"
pub_bytes = tree_size(pub) if pub.is_dir() else 0
print(f"        public/ is {human(pub_bytes)} and is copied verbatim into every build")
if pub_bytes > GB:
    fail(f"public/ alone is over the 1 GB published-site limit", "move the big media off Pages")
elif pub_bytes > 300 * MB:
    warn(f"public/ is {human(pub_bytes)} of the 1 GB published-site limit",
         "each deploy uploads all of it; move video/apk to a bucket or Releases")
else:
    ok(f"public/ is {human(pub_bytes)}, comfortably inside 1 GB")

tracked = [l for l in git("ls-files").splitlines() if l]
tracked_bytes = sum(size(LIVE / f) for f in tracked)
print(f"        {len(tracked)} tracked files, {human(tracked_bytes)}")
if tracked_bytes > GB:
    warn("repo is over the 1 GB recommendation", "git-lfs or move media out")

big = sorted(((size(LIVE / f), f) for f in tracked if size(LIVE / f) > 20 * MB), reverse=True)
if big:
    print(f"        {len(big)} tracked files over 20 MB:")
    for s, f in big[:10]:
        print(f"          {human(s):>9}  {f}")
over100 = [f for s, f in big if s > 100 * MB]
over50  = [f for s, f in big if 50 * MB < s <= 100 * MB]
if over100:
    fail(f"{len(over100)} file(s) over 100 MB — git refuses these", "; ".join(over100[:3]))
elif over50:
    warn(f"{len(over50)} file(s) over 50 MB (git warns, and Pages serves them on a 100 GB/mo budget)",
         "one 64 MB video is ~1,600 plays before the monthly ceiling")
else:
    ok("no tracked file over 50 MB")

# --------------------------------------------------------- 3. did it all ship
print("\ndid the build ship everything")
dist = LIVE / "dist"
if not dist.is_dir():
    warn("no dist/ to check", "run `npm run build` in ../dumb.co, then re-run this")
else:
    missing = []
    if pub.is_dir():
        for r, _dd, ff in os.walk(pub):
            for f in ff:
                if f == ".DS_Store":
                    continue
                src = pathlib.Path(r) / f
                rel = src.relative_to(pub)
                dst = dist / rel
                if not dst.exists():
                    missing.append(str(rel))
                elif size(dst) != size(src):
                    missing.append(f"{rel} (size differs)")
    if missing:
        fail(f"{len(missing)} file(s) from public/ are not in dist/")
        for m in missing[:12]:
            print(f"          {m}")
        if len(missing) > 12:
            print(f"          ... and {len(missing)-12} more")
    else:
        ok("every file in public/ made it into dist/, byte for byte")

    idx = dist / "index.html"
    if idx.exists():
        ok(f"dist/index.html present ({human(size(idx))})")
        refs = set(re.findall(r'(?:src|href)="(/[^"]+)"', idx.read_text(encoding="utf-8", errors="replace")))
        broken = [r for r in refs if not (dist / r.lstrip("/")).exists() and not r.startswith("//")]
        if broken:
            fail(f"{len(broken)} absolute reference(s) in index.html have no file in dist/",
                 ", ".join(sorted(broken)[:4]))
        else:
            ok("every absolute src/href in index.html resolves inside dist/")
    else:
        fail("no dist/index.html")
    print(f"        dist/ total {human(tree_size(dist))}")

# ------------------------------------------------------------------- 4. seo
print("\nsearch basics")
for name in ("robots.txt", "sitemap.xml"):
    if (pub / name).exists(): ok(f"public/{name}")
    else: warn(f"no public/{name}", "see SEO.md")
underscored = [p.name for p in pub.iterdir() if p.name.startswith("_")] if pub.is_dir() else []
if underscored:
    warn(f"public/ has {len(underscored)} entr(y/ies) starting with '_': {', '.join(underscored[:4])}",
         "these only survive because .nojekyll is written — don't remove that step")

print(f"\n  {ok_n} ok, {warn_n} warn, {fail_n} fail\n")
sys.exit(1 if fail_n else 0)
