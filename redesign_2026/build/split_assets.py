#!/usr/bin/env python3
"""Turn the one-file prototype into a site that loads fast.

build.py writes concept/index.html with every image inlined as base64, so it
opens straight from disk (file://) with nothing else beside it. That is right
for passing a file around and wrong for a web server: the page was a single
6.7 MB document, the browser could not paint anything until all of it had
arrived, and every route paid for every photo -- memories, press, team
portraits -- whether or not anyone opened that section. Lighthouse on the
preview (Oct 8, mobile): first paint at 25 s.

This takes that file and writes a served copy of it:

  OUT/index.html          the same page, with each big data: URI replaced by
                          a URL. Images that only appear inside a section
                          live in JS strings, so they are now fetched when
                          that section opens rather than up front.
  OUT/assets/<hash>.ext   the images and fonts, recompressed (photos to
                          WebP), named by content hash so they cache forever
                          and the handset art used twice is one file.
  OUT/<slug>.html         a copy per section. GitHub Pages answers /shop with
                          shop.html (status 200) before it falls back to
                          404.html (status 404), so deep links stop being
                          "not found" to browsers, crawlers and link previews.
  OUT/404.html            still there for anything else.

Usage:
  python3 build/split_assets.py OUT --prefix /dumb.co-redesign-preview/
  python3 build/split_assets.py OUT --prefix /          # served at a root

--prefix is where the site lives. Asset URLs are absolute from it, because
the page is loaded at /shop, /shop/ and / alike and a relative URL would
resolve differently under each.
"""
import argparse, base64, hashlib, io, json, re, shutil, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
SRC = ROOT / "concept" / "index.html"

KEEP_INLINE = 6 * 1024          # small icons stay inline: a request costs more
PHOTO_MAX = 1800                # px, longest side; nothing displays bigger
EXT = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
       "image/gif": "gif", "image/svg+xml": "svg", "font/opentype": "otf",
       "font/otf": "otf", "font/ttf": "ttf", "font/woff2": "woff2", "font/woff": "woff"}

DATA_URI = re.compile(r'data:([a-z]+/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=]+)')


def recompress(mime, raw):
    """Photos to WebP. Returns (bytes, ext). Anything that would not get
    smaller, or that Pillow can't read, is kept as it was."""
    if mime not in ("image/jpeg", "image/png"):
        return raw, EXT.get(mime, "bin")
    try:
        from PIL import Image
        im = Image.open(io.BytesIO(raw))
        im.load()
    except Exception:
        return raw, EXT[mime]
    if max(im.size) > PHOTO_MAX:
        im.thumbnail((PHOTO_MAX, PHOTO_MAX), Image.LANCZOS)
    alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
    im = im.convert("RGBA" if alpha else "RGB")
    out = io.BytesIO()
    # line art with flat colour (the handset, the plan cards) stays sharp at
    # a higher quality; photos are fine at 80
    q = 90 if mime == "image/png" else 80
    im.save(out, "WEBP", quality=q, method=6)
    data = out.getvalue()
    if len(data) >= len(raw):
        return raw, EXT[mime]
    return data, "webp"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("--prefix", default="/")
    ap.add_argument("--src", default=str(SRC))
    a = ap.parse_args()

    prefix = a.prefix if a.prefix.endswith("/") else a.prefix + "/"
    out = Path(a.out)
    (out / "assets").mkdir(parents=True, exist_ok=True)
    html = Path(a.src).read_text()

    written, cache = {}, {}

    def swap(m):
        mime, b64 = m.group(1), m.group(2)
        if len(b64) < KEEP_INLINE:
            return m.group(0)
        if b64 in cache:
            return cache[b64]
        raw = base64.b64decode(b64)
        data, ext = recompress(mime, raw)
        name = hashlib.sha1(data).hexdigest()[:12] + "." + ext
        if name not in written:
            (out / "assets" / name).write_bytes(data)
            written[name] = (len(raw), len(data))
        cache[b64] = url = prefix + "assets/" + name
        return url

    html = DATA_URI.sub(swap, html)

    # routes: the same slug map the page itself uses
    m = re.search(r"const ROUTES\s*=\s*(\{[^}]*\})", html)
    routes = json.loads(m.group(1)) if m else {}
    if not routes:
        sys.exit("split_assets: could not find ROUTES in the page")

    # the favicon the page links to (public/ is the live site's static folder)
    for f in ("favicon.png", "favicon.ico"):
        src = ROOT.parent / "public" / f
        if src.is_file():
            shutil.copyfile(src, out / f)

    (out / "index.html").write_text(html)
    (out / "404.html").write_text(html)
    for slug in routes.values():
        (out / f"{slug}.html").write_text(html)

    before = sum(b for b, _ in written.values())
    after = sum(c for _, c in written.values())
    print(f"    index.html      {len(html)/1048576:6.2f} MB  (was {SRC.stat().st_size/1048576:.2f} MB)"
          if Path(a.src) == SRC else f"    index.html      {len(html)/1048576:6.2f} MB")
    print(f"    assets/         {len(written)} files, {after/1048576:.2f} MB (from {before/1048576:.2f} MB)")
    print(f"    routes          {', '.join(sorted(routes.values()))}")


if __name__ == "__main__":
    main()
