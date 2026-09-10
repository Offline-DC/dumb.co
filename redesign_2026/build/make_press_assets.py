#!/usr/bin/env python3
"""
Mirrors the live press page's data into the prototype.

Reads ../dumb.co/src/Press/press_data.md (the same file the React page parses)
and the matching images from ../dumb.co/src/Press/images, then writes
assets/press/*.webp thumbnails plus assets/press/manifest.json.

The originals total ~5.8MB; the live page renders them as 100px squares, so
these are cropped to 220px WebP — about 200KB for all 22, which keeps the
single-file prototype openable.
"""
import json, pathlib, re, subprocess, sys, tempfile
from PIL import Image  # Pillow 12 reads AVIF and WebP natively

ROOT   = pathlib.Path(__file__).resolve().parent.parent

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
SITE   = find_live_app(ROOT) / "src" / "Press"
IMGDIR = SITE / "images"
OUT    = ROOT / "assets" / "press"
OUT.mkdir(parents=True, exist_ok=True)

raw = (SITE / "press_data.md").read_text(encoding="utf-8")

# same block/key parsing shape as parsePressData.ts
items = []
for block in re.split(r"\n\s*\n+", raw.replace("\r\n", "\n")):
    m = {}
    for line in (l.strip() for l in block.split("\n")):
        if not line or line.startswith("#") or ":" not in line:
            continue
        k, v = line.split(":", 1)
        k, v = k.strip().lower(), v.strip()
        if k and v:
            m[k] = v
    if not all(k in m for k in ("id", "title", "href", "image_name")):
        continue
    items.append(m)

print(f"  parsed {len(items)} press items")

NEARMISS = []

def resolve(name):
    """Exact match first, mirroring parsePressData.ts. Then a token-subset
    fallback that the real page does NOT have — any hit there is a live bug,
    because that press item is currently being skipped on dumb.co."""
    p = IMGDIR / name
    if p.exists():
        return p
    base = name.split("/")[-1]
    for c in IMGDIR.iterdir():
        if c.name == base:
            return c
    want = set(re.split(r"[^a-z0-9]+", base.lower())) - {""}
    best = None
    for c in IMGDIR.iterdir():
        if not c.is_file():
            continue
        have = set(re.split(r"[^a-z0-9]+", c.name.lower())) - {""}
        if have and (have <= want or want <= have):
            best = c
            break
    if best is not None:
        NEARMISS.append((name, best.name))
        return best
    return None

manifest, missing = [], []
for i, it in enumerate(items):
    src = resolve(it["image_name"])
    if src is None:
        missing.append(it["image_name"])
        continue
    slug = re.sub(r"[^a-z0-9]+", "-", it["id"].lower()).strip("-") or f"item{i}"
    dest = OUT / f"{slug}.webp"
    try:
        im0 = Image.open(src)
    except Exception:
        # one item points at an SVG, which PIL can't read — rasterise it first
        tmp = pathlib.Path(tempfile.mkdtemp()) / "svg.png"
        try:
            subprocess.run(["convert", "-background", "white", "-density", "220",
                            str(src), str(tmp)], check=True, capture_output=True)
            im0 = Image.open(tmp)
        except Exception as e:
            missing.append(f"{it['image_name']} ({e.__class__.__name__})")
            continue
    with im0 as im:
        im = im.convert("RGB")
        w, h = im.size
        s = min(w, h)
        im = im.crop(((w - s) // 2, (h - s) // 2, (w + s) // 2, (h + s) // 2))
        im = im.resize((220, 220), Image.LANCZOS)
        im.save(dest, "WEBP", quality=72, method=6)
    href = it["href"].strip()
    if not re.match(r"^https?://", href) and not href.startswith("#"):
        href = "https://" + href
    manifest.append({
        "id": it["id"],
        "title": it["title"],
        "source": it.get("source", ""),
        "href": href,
        "file": dest.name,
        "bytes": dest.stat().st_size,
    })

(OUT / "manifest.json").write_text(json.dumps(manifest, indent=1), encoding="utf-8")
total = sum(m["bytes"] for m in manifest)
print(f"  wrote {len(manifest)} thumbnails -> assets/press/  ({total/1024:.0f} KB total)")
if missing:
    print("  ! unresolved images:", missing)
if NEARMISS:
    print("  ! LIVE BUG — press_data.md image_name does not match any file, so")
    print("    these items are silently skipped on the real dumb.co press page:")
    for want, got in NEARMISS:
        print(f'      "{want}"  ->  actual file is "{got}"')
