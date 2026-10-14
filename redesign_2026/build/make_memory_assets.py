#!/usr/bin/env python3
"""
Builds assets/memories/*.jpg from the real event shoots in
../dumb.co/design-assets_dontpush. Only events that have actually happened.
EXIF orientation is applied — several of the gallery frames are shot sideways.
"""
import pathlib
from PIL import Image, ImageOps

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
SRC = find_live_app(ROOT) / "design-assets_dontpush"
OUT = pathlib.Path(__file__).resolve().parent.parent / "assets" / "memories"
OUT.mkdir(parents=True, exist_ok=True)

MO = SRC / "Sonya Photos " / "MO.gallery.08-26.NYC"
PR = SRC / "Marketing Events" / "DC PRIDE 26_"

PICKS = [
    ("mo-1", MO / "100_1510.JPG"), ("mo-2", MO / "100_1514.JPG"), ("mo-3", MO / "100_1516.JPG"),
    ("mo-4", MO / "100_1520.JPG"), ("mo-5", MO / "100_1524.JPG"),
    ("pride-1", PR / "CIMG2453.JPG"), ("pride-2", PR / "CIMG2457.JPG"),
    ("pride-3", PR / "CIMG2461.JPG"), ("pride-4", PR / "CIMG2465.JPG"),
    ("pride-5", PR / "CIMG2469.JPG"), ("pride-6", PR / "CIMG2474.JPG"),
]

for name, src in PICKS:
    if not src.exists():
        print(f"  ! missing {src}"); continue
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    w, h = im.size
    im = im.resize((900, round(h * 900 / w)), Image.LANCZOS)
    im.save(OUT / f"{name}.jpg", "JPEG", quality=68, optimize=True, progressive=True)
print(f"wrote {len(PICKS)} memory photos to {OUT}")
