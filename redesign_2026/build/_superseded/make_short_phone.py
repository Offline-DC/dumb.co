#!/usr/bin/env python3
"""
Make a shorter handset from assets/flipphone.png -> assets/flipphone_short.png

Matteo: "the screen is too small on mobile. I'd ask Marco to create a version
that has less space above and below the screen so we can increase the size of
the pages." This approximates that with the art we already have, so we aren't
blocked on Marco.

Two cuts, both measured rather than eyeballed:

  1. 40 rows out of the blank body between the screen and the keypad. The body
     edges there drift 3px over those 40 rows, which is inside the wobble of a
     hand-drawn line.
  2. The number keys. They were never interactive -- navigation is the d-pad --
     and on a phone they were mostly below the fold anyway. The phone's bottom
     edge is grafted back on so the body still closes; the two edges meet 4px
     and 2px apart, again inside the stroke width.

Result: the art goes 843px -> 598px tall, so the screen is 40% of the handset
instead of 28% -- the same screen is ~41% bigger at a given on-screen height.

    python3 build/make_short_phone.py && python3 build/trace_screen.py \\
      && python3 build/build.py

Re-run all three if Marco ever replaces flipphone.png.
"""
import sys, pathlib
import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC  = ROOT / "assets" / "flipphone.png"
OUT  = ROOT / "assets" / "flipphone_short.png"

GAP_FROM, GAP_TO = 375, 415      # blank body rows to delete
CROP_AT          = 650           # below the d-pad cluster, above the number keys
CAP_FROM         = 833           # where the phone's bottom edge begins


def must(c, m):
    if not c:
        sys.exit("SHORTEN FAILED: " + m)


def main():
    must(SRC.exists(), f"{SRC} missing")
    im = Image.open(SRC).convert("RGBA")
    a = np.array(im)
    H, W = a.shape[:2]
    ink = a[..., 3] > 128

    must(H > CAP_FROM, "art is shorter than expected - re-measure before trusting these rows")

    def edges(y):
        xs = np.where(ink[y])[0]
        return (int(xs.min()), int(xs.max())) if len(xs) else (None, None)

    # the cuts are only safe where the body runs straight; check, don't assume
    l0, r0 = edges(GAP_FROM); l1, r1 = edges(GAP_TO)
    must(None not in (l0, r0, l1, r1), "no body edge found at the gap rows")
    must(abs(l0 - l1) <= 6 and abs(r0 - r1) <= 6,
         f"body edges drift {abs(l0-l1)}/{abs(r0-r1)}px across the gap - the cut would show")

    lc, rc = edges(CROP_AT); lp, rp = edges(CAP_FROM)
    must(None not in (lc, rc, lp, rp), "no body edge at the graft rows")
    must(abs(lc - lp) <= 8 and abs(rc - rp) <= 8,
         f"graft edges are {abs(lc-lp)}/{abs(rc-rp)}px apart - the join would show")

    top    = a[:GAP_FROM]
    middle = a[GAP_TO:CROP_AT]
    cap    = a[CAP_FROM:]
    out = np.vstack([top, middle, cap])

    Image.fromarray(out).save(OUT)
    ink2 = out[..., 3] > 128
    ys = np.where(ink2.any(axis=1))[0]
    print(f"  {SRC.name} {W}x{H}  ->  {OUT.name} {W}x{out.shape[0]}")
    print(f"  removed {(GAP_TO-GAP_FROM) + (CAP_FROM-CROP_AT)}px "
          f"({GAP_TO-GAP_FROM} of blank body, {CAP_FROM-CROP_AT} of number keys)")
    print(f"  ink now spans y {ys.min()}..{ys.max()}")
    print(f"  next: python3 build/trace_screen.py  (the screen + keys moved)")


if __name__ == "__main__":
    main()
