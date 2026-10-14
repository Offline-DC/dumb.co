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

# How wide the arrow is IN ARTWORK PIXELS.
#
# Walking out from the OK circle's centre along each axis, the ink sits at
# these radii (artwork px, circle interior radius 41):
#
#   right   K 7..14,  ring 41..44   -> clear 15..40, 26px of room
#   left    O 5..9 and 19..23, ring 42..44 -> clear 24..41, 18px  <- the binding one
#   up      ring 42..45            -> clear 1..41
#   down    ring 42..45            -> clear 1..41
#
# So the left arrow has 18px to live in and everything else follows from that.
# A chevron is 107/128 as tall as it is wide, so a 13px box is 10.9px across
# turned on its side: centred at radius 32.5 it spans 27.1..37.9 and clears
# both the O and the rim by 3px. 15px left barely 2px and read as touching.
# build/trace_screen.py imports this to place the keys and set background-size.
ARROW_ART_W = 13

MEASURE = 512       # a fixed width to compare stroke weights at, nothing more


def must(c, m):
    if not c:
        sys.exit("ARROWS FAILED: " + m)


def ink_mask(path):
    """Real ink only: opaque AND dark. Faint scanner dust fails both."""
    im = Image.open(path).convert("RGBA")
    a = np.array(im)
    return ((a[..., 3] > 128) & (a[..., :3].mean(axis=2) < 110)).astype(np.uint8), im.size


def ink_grey(path):
    """The same ink, but keeping how solid each pixel is.

    The handset art is 78% partial-alpha -- marker on paper, and that soft
    speckled edge is most of what makes it look drawn. Binarising the chevron
    threw all of it away and the arrows came back looking like vector clip-art
    sitting on a drawing.
    """
    a = np.array(Image.open(path).convert("RGBA"))
    dark = 255 - a[..., :3].mean(axis=2)
    return np.minimum(a[..., 3], dark).astype(np.uint8)


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


def art_grain(path):
    """The handset's own edge grain, as a zero-centred field.

    Blur the art's alpha and subtract it: what is left is the high-frequency
    wobble of marker on paper, with the shapes themselves removed.
    """
    a = np.array(Image.open(path).convert("RGBA"))[..., 3].astype(np.float32)
    grain = a - cv2.GaussianBlur(a, (0, 0), 1.6)
    sd = grain.std()
    return grain / sd if sd > 1e-6 else grain


def roughen(alpha, grain):
    """Imprint that grain on the arrow's outline.

    Marco drew the chevron far larger than the phone's lines were drawn, so
    shrinking it to d-pad size shrinks its grain past the point of visibility --
    12x down, and a clean vector edge is what comes back. No amount of care in
    the dilation fixes that: the texture has to be put back at the size it is
    seen. It is the handset's own grain, not invented noise, rescaled so its
    features land at the size they land at on the rest of the drawing, and used
    as a wobbling threshold so the outline wanders rather than the fill going
    blotchy.

    GRAIN_SCALE: the art draws at about 1.38x on a phone and the arrow at about
    0.26x, so the art's grain has to be blown up ~5.3x to read the same size.
    GRAIN_AMP: how far the edge is allowed to wander, in eighths of a pixel of
    the finished arrow. Past about 60 it starts eating the tips of the chevron.
    """
    GRAIN_SCALE, GRAIN_AMP = 5.3, 46.0
    h, w = alpha.shape
    gh, gw = grain.shape
    tile = cv2.resize(grain, (round(gw * GRAIN_SCALE), round(gh * GRAIN_SCALE)),
                      interpolation=cv2.INTER_LINEAR)
    # take it from the middle of the art, where the strokes are, not a margin
    y0, x0 = (tile.shape[0] - h) // 2, (tile.shape[1] - w) // 2
    field = tile[y0:y0 + h, x0:x0 + w]

    a = alpha.astype(np.float32)
    edge = cv2.GaussianBlur(a, (0, 0), 2.0)
    band = np.clip(1.0 - np.abs(edge - 128.0) / 128.0, 0, 1)   # only near the outline
    out = np.clip(a + GRAIN_AMP * field * band, 0, 255)
    # a whisker of blur so the new edge is not stair-stepped
    return cv2.GaussianBlur(out, (0, 0), 0.6).astype(np.uint8)


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

    # the silhouette decides WHICH ink is the chevron; the grey decides how
    # solid each pixel of it is
    sel = (lab[y:y + h, x:x + w] == keep)
    chev = sel.astype(np.uint8)
    chev_grey = np.where(sel, ink_grey(SRC)[y:y + h, x:x + w], 0).astype(np.uint8)

    # ---- match the pen ---------------------------------------------------
    # Thicken at the SCAN'S OWN resolution. Shrinking the chevron first and
    # dilating the small copy was what made these look like clip-art: the
    # downscale averaged away the marker's ragged edge, and then a smooth
    # kernel drew a smooth new one. At 1:1 the dilation radius is large
    # compared to the grain, so the grain rides along.
    # Room to grow, too: cv2.dilate does not enlarge the array, it clips
    # against it, and the ink runs right up to all four edges of its bbox.
    big = np.pad(chev_grey, max(w, h) // 3)

    target = art_stroke * (MEASURE / ARROW_ART_W)   # the handset's pen, at MEASURE

    def normalised(m):
        """Trim to the ink and rescale to a fixed width for measuring.

        Measuring has to happen here, not on the padded working array.
        Dilation widens the whole chevron as well as its stroke, so a stroke
        that hits the target mid-loop is thinner than the target once the
        result is scaled back to the size it is actually drawn at. This closes
        that loop: what we measure is the geometry that ships.
        """
        ys, xs = np.nonzero(m > 127)
        cut = m[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
        ch, cw = cut.shape
        return cv2.resize(cut, (MEASURE, max(1, round(ch * MEASURE / cw))),
                          interpolation=cv2.INTER_AREA)

    solid = lambda g: (g > 127).astype(np.uint8)   # for measuring only

    def grow(r):
        """Grayscale dilation by radius r. A max filter over a soft edge pushes
        that edge outward and keeps its profile, where dilating a binarised
        mask would hand back a clean hard one."""
        if r <= 0:
            return big
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))
        return cv2.dilate(big, k)

    before = stroke_width(solid(normalised(big)))
    must(before > 0, "measured a zero-width stroke on the chevron")

    # bisect the radius rather than stepping: at full scan resolution the step
    # count would be in the hundreds, and each one costs a distance transform
    lo, hi = 0, max(w, h) // 4
    must(stroke_width(solid(normalised(grow(hi)))) >= target,
         "cannot reach the handset's stroke weight even at the maximum radius")
    while lo < hi:
        mid = (lo + hi) // 2
        if stroke_width(solid(normalised(grow(mid)))) < target:
            lo = mid + 1
        else:
            hi = mid
    steps = lo
    final = normalised(grow(steps))
    after = stroke_width(solid(final))

    # ---- square it so every rotation lands identically --------------------
    gh, gw = final.shape
    side = max(gw, gh)
    sq = np.zeros((side, side), np.uint8)
    sq[(side - gh) // 2:(side - gh) // 2 + gh, (side - gw) // 2:(side - gw) // 2 + gw] = final

    box = SIZE
    small = cv2.resize(sq, (box, box), interpolation=cv2.INTER_AREA)
    small = roughen(small, art_grain(ART))
    rgba = np.zeros((box, box, 4), np.uint8)
    rgba[..., 3] = small                       # black ink, alpha carries the shape
    up = Image.fromarray(rgba, "RGBA")

    for name, deg in (("up", 0), ("right", 270), ("down", 180), ("left", 90)):
        out = ROOT / "assets" / f"dpad-{name}.png"
        up.rotate(deg, resample=Image.BICUBIC, expand=False).save(out, optimize=True)
        print(f"  {out.name:16s} {box}x{box}  {out.stat().st_size / 1024:5.1f} KB")

    print(f"  source {src_size[0]}x{src_size[1]} -> chevron {w}x{h}"
          f" (dropped {dropped}px of specks outside it)")
    k = ARROW_ART_W / MEASURE
    print(f"  pen: handset {art_stroke:.2f}px at {artW}px wide;"
          f" chevron {before * k:.2f} -> {after * k:.2f} art px"
          f" (dilated {steps}px at scan resolution)")
    print(f"  arrow is {ARROW_ART_W}px wide in artwork terms"
          f" -> background-size {100 * ARROW_ART_W / artW:.2f}cqw")


if __name__ == "__main__":
    main()
