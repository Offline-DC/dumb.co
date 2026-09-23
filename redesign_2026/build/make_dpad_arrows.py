#!/usr/bin/env python3
"""
Turn assets/sync-arrow.png into the four d-pad arrows.

Marco drew the chevron; this isolates it, matches it to the handset's pen
weight, and rotates it into up / right / down / left, written to
assets/dpad-{dir}.png. The build inlines those as base64, which is why the
source size matters: the original is 5000x4000 with the ink in one corner, and
inlining that raw would have added most of a megabyte of empty canvas to a page
that is already 6MB.

    python3 build/make_dpad_arrows.py && python3 build/build.py

Re-run if the drawing is replaced.

Two things this gets right that the naive version did not:

1. IT CROPS TO THE CHEVRON, NOT TO THE ALPHA BBOX. The scan carries faint
   specks of dust and pencil below and right of the stroke. They are nearly
   invisible but they are not transparent, so cropping to `getbbox()` produced
   a box much larger than the chevron, with the chevron sitting in its
   top-left. Every arrow then rendered off-centre -- and in a DIFFERENT
   direction per rotation, which is what made the d-pad look crooked. We
   threshold to real ink and keep the largest connected blob.

2. IT MATCHES THE HANDSET'S PEN. A stroke is a fixed width in the artwork
   (~4px at 560px wide) no matter how big the thing it draws is. Scaling the
   chevron down to d-pad size scaled its stroke down with it, so it landed at
   about a third of the weight of every other line on the phone and read as a
   hairline. We measure the handset's stroke and this one with the SAME
   estimator -- so any bias cancels -- and dilate until they agree.
"""
import sys, pathlib
import numpy as np
import cv2
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC  = ROOT / "assets" / "sync-arrow.png"
ART  = ROOT / "assets" / "flipphone_bigscreen.png"
SIZE = 128          # output canvas; ~44px on screen, so comfortably retina

# How wide the arrow is IN ARTWORK PIXELS. The handset art is 560px wide, the
# OK circle 82px across, and the clear ring inside it is narrow -- see
# build/trace_screen.py, which imports this to place the keys and to set
# background-size. 24px is the widest chevron that still sits inside the drawn
# circle without touching the "OK" lettering.
ARROW_ART_W = 24

WORK = 16           # supersample: dilate at 16x art scale, then come back down


def must(c, m):
    if not c:
        sys.exit("ARROWS FAILED: " + m)


def ink_mask(path):
    """Real ink only: opaque AND dark. Faint scanner dust fails both."""
    im = Image.open(path).convert("RGBA")
    a = np.array(im)
    return ((a[..., 3] > 128) & (a[..., :3].mean(axis=2) < 110)).astype(np.uint8), im.size


def stroke_width(mask):
    """Typical stroke width, via the distance transform's ridge.

    Every pixel gets its distance to the nearest edge; along the centre line of
    a stroke that distance is half the stroke's width, and it is a local
    maximum there. Taking the median over those ridge pixels gives the typical
    half-width regardless of how long, bent or branched the stroke is.

    Area-over-skeleton-length was the obvious alternative and it is wrong here:
    the morphological skeleton over-counts at elbows, so a short fat chevron
    reads much thinner than it is and the dilation loop overshoots badly. The
    handset is dozens of long thin lines and the chevron is one short bent one,
    so the bias does not cancel between them.
    """
    dist = cv2.distanceTransform(mask, cv2.DIST_L2, 5)
    peak = cv2.dilate(dist, np.ones((3, 3), np.float32))
    ridge = dist[(dist > 0.6) & (dist >= peak - 1e-6)]
    return float(np.median(ridge) * 2) if ridge.size else 0.0


def main():
    must(SRC.exists(), f"{SRC} missing")
    must(ART.exists(), f"{ART} missing - the pen weight is measured off it")

    # ---- what does the handset's pen weigh? ------------------------------
    art_mask, (artW, _) = ink_mask(ART)
    art_stroke = stroke_width(art_mask)
    must(art_stroke > 0, "measured a zero-width stroke on the handset art")

    # ---- isolate the chevron --------------------------------------------
    mask, src_size = ink_mask(SRC)
    must(mask.sum() > 0, "the source has no ink above threshold - is it a faint scan?")
    n, lab, stats, _ = cv2.connectedComponentsWithStats(mask, 8)
    must(n > 1, "no connected ink found in the source")
    keep = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    x, y, w, h, area = stats[keep]
    dropped = int(mask.sum()) - int(area)
    must(w > 20 and h > 20, f"the chevron is only {w}x{h}px - too small to use")

    chev = (lab[y:y + h, x:x + w] == keep).astype(np.uint8)

    # ---- match the pen ---------------------------------------------------
    # Work at WORK x art scale: the chevron is ARROW_ART_W art px wide there.
    work_w = ARROW_ART_W * WORK
    work_h = max(1, round(h * work_w / w))
    big = cv2.resize(chev * 255, (work_w, work_h), interpolation=cv2.INTER_AREA)
    big = (big > 127).astype(np.uint8)
    # room to grow: cv2.dilate does not enlarge the array, it clips against it,
    # and the chevron's ink runs right up to all four edges of its own bbox
    pad = work_w // 4
    big = np.pad(big, pad)

    target = art_stroke * WORK          # the handset's pen, in this same space

    def normalised(m):
        """Trim to the ink and rescale it to exactly ARROW_ART_W wide.

        Measuring has to happen here, not on the padded working array.
        Dilation widens the whole chevron as well as its stroke, so a stroke
        that hits the target mid-loop is thinner than the target once the
        result is scaled back down to the size it is actually drawn at. This
        closes that loop: what we measure is the geometry that ships.
        """
        ys, xs = np.nonzero(m)
        cut = m[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
        ch, cw = cut.shape
        out = cv2.resize(cut * 255, (work_w, max(1, round(ch * work_w / cw))),
                         interpolation=cv2.INTER_AREA)
        return (out > 127).astype(np.uint8)

    before = stroke_width(normalised(big))
    must(before > 0, "measured a zero-width stroke on the chevron")

    # dilate in small steps and re-measure: one big kernel overshoots, because
    # dilation fattens the elbow faster than the straight runs
    grown, steps = big, 0
    while stroke_width(normalised(grown)) < target and steps < 400:
        grown = cv2.dilate(grown, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))
        steps += 1
    final = normalised(grown)
    after = stroke_width(final)

    # ---- square it so every rotation lands identically --------------------
    gh, gw = final.shape
    side = max(gw, gh)
    sq = np.zeros((side, side), np.uint8)
    sq[(side - gh) // 2:(side - gh) // 2 + gh, (side - gw) // 2:(side - gw) // 2 + gw] = final

    box = SIZE
    small = cv2.resize(sq * 255, (box, box), interpolation=cv2.INTER_AREA)
    rgba = np.zeros((box, box, 4), np.uint8)
    rgba[..., 3] = small                       # black ink, alpha carries the shape
    up = Image.fromarray(rgba, "RGBA")

    for name, deg in (("up", 0), ("right", 270), ("down", 180), ("left", 90)):
        out = ROOT / "assets" / f"dpad-{name}.png"
        up.rotate(deg, resample=Image.BICUBIC, expand=False).save(out, optimize=True)
        print(f"  {out.name:16s} {box}x{box}  {out.stat().st_size / 1024:5.1f} KB")

    print(f"  source {src_size[0]}x{src_size[1]} -> chevron {w}x{h}"
          f" (dropped {dropped}px of specks outside it)")
    print(f"  pen: handset {art_stroke:.2f}px at {artW}px wide;"
          f" chevron {before / WORK:.2f} -> {after / WORK:.2f} art px in {steps} steps")
    print(f"  arrow is {ARROW_ART_W}px wide in artwork terms"
          f" -> background-size {100 * ARROW_ART_W / artW:.2f}cqw")


if __name__ == "__main__":
    main()
