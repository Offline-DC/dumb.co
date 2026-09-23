#!/usr/bin/env python3
"""
Turn assets/sync-arrow.png into the four d-pad arrows.

Marco drew the chevron; this trims it, scales it down and rotates it into
up / right / down / left, written to assets/dpad-{dir}.png. The build inlines
those as base64, which is why the source size matters: the original is
5000x4000 with the ink in one corner, and inlining that raw would have added
most of a megabyte of empty canvas to a page that is already 6MB.

    python3 build/make_dpad_arrows.py && python3 build/build.py

Re-run if the drawing is replaced.
"""
import sys, pathlib
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC  = ROOT / "assets" / "sync-arrow.png"
SIZE = 128          # the key is ~44px on screen; this is comfortably retina


def must(c, m):
    if not c:
        sys.exit("ARROWS FAILED: " + m)


def main():
    must(SRC.exists(), f"{SRC} missing")
    im = Image.open(SRC).convert("RGBA")

    bb = im.split()[-1].getbbox()
    must(bb is not None, "the source is fully transparent - nothing to trim to")
    ink = im.crop(bb)
    w, h = ink.size
    must(w > 20 and h > 20, f"the ink is only {w}x{h}px - too small to use")

    # square it on its own centre so every rotation lands identically; without
    # this a chevron wider than it is tall would shift as it turned
    side = max(w, h)
    sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    sq.paste(ink, ((side - w) // 2, (side - h) // 2))
    sq = sq.resize((SIZE, SIZE), Image.LANCZOS)

    for name, deg in (("up", 0), ("right", 270), ("down", 180), ("left", 90)):
        out = ROOT / "assets" / f"dpad-{name}.png"
        sq.rotate(deg, resample=Image.BICUBIC, expand=False).save(out, optimize=True)
        print(f"  {out.name:16s} {SIZE}x{SIZE}  {out.stat().st_size/1024:5.1f} KB")

    print(f"  from {SRC.name}: {im.size[0]}x{im.size[1]} -> ink {w}x{h} -> {SIZE}x{SIZE}")


if __name__ == "__main__":
    main()
