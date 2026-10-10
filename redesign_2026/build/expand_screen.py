#!/usr/bin/env python3
"""
Make the handset's screen bigger without touching the rest of the drawing.
assets/flipphone.png -> assets/flipphone_bigscreen.png

Laff: "we really just need to expand the window of the screen, the inner
squiggly part. That should just be bigger." And keep the whole phone.

The drawn screen sits in an upper panel with a lot of unused body below it:
the panel interior is 229x418 and the screen only 179x242. Width is nearly
spent (1.12x available) but there is 1.61x of vertical room, so the screen
grows mostly downward.

It is 9-sliced rather than scaled. Scaling the border bitmap would thicken
the strokes with it -- stretch it 40% taller and the top and bottom lines get
40% fatter, which on a marker drawing reads instantly as wrong. Slicing keeps
the four corners at their drawn size and stretches only the straight runs
between them, and stretching a vertical line lengthwise doesn't change its
width at all. The result is the same pen, a bigger window.

    python3 build/expand_screen.py && python3 build/trace_screen.py \\
      && python3 build/build.py
"""
import sys, pathlib
import numpy as np
from PIL import Image
import cv2   # scipy isn't installed on the laptop; cv2 already is

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC  = ROOT / "assets" / "flipphone.png"
OUT  = ROOT / "assets" / "flipphone_bigscreen.png"

# Re-measured for Marco's 1200x3600 handset. The old numbers were for a
# 560x921 drawing and are wrong here by roughly the 2.14x scale between them.
# Measured down the centre column of the new art:
#     lid's outer edge      53..77
#     screen's top stroke  303..327     -> 226px of slack ABOVE the screen
#     screen's bottom     1567..1590
#     hinge's top         1642..1663    ->  52px of slack BELOW
# and across it at y=950:
#     lid edge 153..172, screen 221..255 .. 996..1013, lid edge 1051..1075
#                                        ->  49px left, 38px right
# So there is 278px of vertical room and 87px of horizontal, against a screen
# 1240px tall and 741px wide. I first reported this as unexpandable having
# only looked BELOW the screen, where there really is almost nothing; the room
# is above it, inside the lid.
PAD     = 26     # Marco's screen stroke is ~24px; this clears it with 2px spare
CORNER  = 90     # kept 1:1 so the drawn corners don't distort (40 * 2.14)
CLEAR_MIN = 18   # the tightest the screen may come to any other ink, corners
                 # included. The lid's corners are round and the screen's are
                 # not, so this is what actually limits the screen's size --
                 # not the straight runs, which end up with far more air.
                 # Measured against the alternatives: 10 -> 1404px of screen
                 # but only 11px of corner gap (3px on a phone, reads as
                 # touching), 26 -> a comfortable 26 but the screen drops to
                 # 1340. 18 is ~0.75x the drawn stroke width, so it reads as a
                 # deliberate gap, and keeps 1380.
MARGIN  = 26     # body left showing around the screen inside the panel
# Measured against the panel the script finds (x[173,1050] y[75,1641]): the
# block is the aperture plus PAD either side, 831x1327. Horizontally that
# leaves 7px once the margins are taken, so the screen is already as wide as
# the lid allows and 1.00 is the honest number rather than a wish. The room
# is vertical, and nearly all of it is ABOVE the screen.
GROW_W  = 1.00
GROW_H  = 1.25   # a ceiling only; the height is derived from the side margin


def must(c, m):
    if not c:
        sys.exit("EXPAND FAILED: " + m)


def main():
    must(SRC.exists(), f"{SRC} missing")
    im = Image.open(SRC).convert("RGBA")
    a = np.array(im)
    H, W = a.shape[:2]
    alpha = a[..., 3]
    n, lab = cv2.connectedComponents((alpha <= 128).astype(np.uint8), connectivity=4)

    # the screen: the hole you land in starting from the middle of it
    sid = lab[int(H * 0.255), int(W * 0.50)]
    must(sid != 0, "seed landed on ink, not inside the screen")
    ys, xs = np.where(lab == sid)
    sx0, sx1, sy0, sy1 = int(xs.min()), int(xs.max()), int(ys.min()), int(ys.max())

    # The panel that contains the screen, so we know how much room there is.
    #
    # This used to look for an ENCLOSED region whose box contains the screen's
    # -- true of the old handset, whose lid was a closed loop with a sealed
    # interior. Marco's lid outline is not closed: its inside is continuous
    # with the page around the phone, so the only region containing the screen
    # is the background itself and the search found nothing ("couldn't find
    # the panel the screen sits in") on a drawing that obviously has one.
    #
    # Measure the surrounding INK instead, which does not care whether any
    # outline happens to be watertight: walk out from the middle of the screen
    # in each direction and stop at the far side of the first stroke you meet.
    # That stroke is the lid's edge, and the gap you just crossed is the room.
    ink = alpha > 128

    def wall(vec, start, step):
        """Walk out from inside the screen and stop just short of the LID.

           Three legs, because there are two strokes in the way and the first
           one is the screen's own: clear -> screen's stroke -> the body gap we
           are measuring -> the lid's stroke. Stopping at the first ink found
           the screen's own border and reported 14px of room where there are
           226. Returns the last clear pixel before the lid."""
        i = start
        for want_ink in (True, False, True):          # reach, cross, cross
            while 0 <= i < len(vec) and vec[i] != want_ink:
                i += step
            if not (0 <= i < len(vec)):
                return None
            if want_ink:                               # now walk through it
                while 0 <= i < len(vec) and vec[i]:
                    i += step
                    if not (0 <= i < len(vec)):
                        return None
                if want_ink and i == start:
                    return None
        return None

    def panel_edge(vec, start, step):
        i = start
        while 0 <= i < len(vec) and not vec[i]:        # to the screen's stroke
            i += step
        while 0 <= i < len(vec) and vec[i]:            # across the screen's stroke
            i += step
        while 0 <= i < len(vec) and not vec[i]:        # across the body gap
            i += step
        if not (0 <= i < len(vec)):
            return None
        return i - step                                # last clear before the lid

    # Scan on MANY lines and take the median, not one line through the middle.
    # The lid is drawn by hand and wobbles: measured on a single row its left
    # edge moved 5px between one scanline and another, and centring the screen
    # on that one reading left 33px of gap above against 49 below, 36 left
    # against 49 right. A median across the screen's whole span is stable
    # against the wobble and lands the screen where it looks centred.
    cy, cx = (sy0 + sy1) // 2, (sx0 + sx1) // 2

    def med(vals):
        v = sorted(x for x in vals if x is not None)
        must(v, "couldn't find the lid's stroke on one of the four sides")
        return int(np.median(v))

    xs_scan = np.linspace(sx0 + (sx1 - sx0) * 0.15, sx1 - (sx1 - sx0) * 0.15, 21).astype(int)
    ys_scan = np.linspace(sy0 + (sy1 - sy0) * 0.15, sy1 - (sy1 - sy0) * 0.15, 21).astype(int)
    py0 = med([panel_edge(ink[:, x], cy, -1) for x in xs_scan])
    py1 = med([panel_edge(ink[:, x], cy, +1) for x in xs_scan])
    px0 = med([panel_edge(ink[y, :], cx, -1) for y in ys_scan])
    px1 = med([panel_edge(ink[y, :], cx, +1) for y in ys_scan])
    must(px0 < sx0 and px1 > sx1 and py0 < sy0 and py1 > sy1,
         "the measured panel doesn't actually contain the screen")
    print(f"  panel measured from the ink: x[{px0},{px1}] y[{py0},{py1}]  "
          f"(room: {sx0-px0}px left, {px1-sx1}px right, "
          f"{sy0-py0}px above, {py1-sy1}px below)")

    # the border block we're going to re-slice: the aperture plus its stroke
    bx0, by0 = sx0 - PAD, sy0 - PAD
    bx1, by1 = sx1 + PAD, sy1 + PAD
    must(bx0 > px0 and by0 > py0 and bx1 < px1 and by1 < py1,
         "the screen border already reaches the panel edge")
    bw, bh = bx1 - bx0 + 1, by1 - by0 + 1

    nw = int(round(bw * GROW_W))
    room_w = (px1 - MARGIN) - (px0 + MARGIN) + 1
    must(nw <= room_w, f"new screen {nw}px wide, only {room_w}px of panel to put it in")

    block = a[by0:by1 + 1, bx0:bx1 + 1].copy()

    # Everything that is drawn EXCEPT the screen border we are replacing.
    # `dist` is then, for every pixel, how far it is from the nearest of that
    # ink -- so the tightest clearance of a candidate screen is simply the
    # minimum of `dist` over the pixels the screen actually inks.
    other = (alpha > 128).copy()
    other[by0:by1 + 1, bx0:bx1 + 1] = False
    dist = cv2.distanceTransform((~other).astype(np.uint8), cv2.DIST_L2, 5)

    def slice9(nh):
        def piece(y0, y1, x0, x1, size):
            pp = Image.fromarray(block[y0:y1, x0:x1])
            return (np.array(pp.resize(size, Image.LANCZOS))
                    if size != (x1 - x0, y1 - y0) else np.array(pp))
        c = CORNER
        o = np.zeros((nh, nw, 4), np.uint8)
        mw, mh = nw - 2 * c, nh - 2 * c
        o[:c, :c]            = piece(0, c, 0, c, (c, c))                   # corners 1:1
        o[:c, nw - c:]       = piece(0, c, bw - c, bw, (c, c))
        o[nh - c:, :c]       = piece(bh - c, bh, 0, c, (c, c))
        o[nh - c:, nw - c:]  = piece(bh - c, bh, bw - c, bw, (c, c))
        o[:c, c:nw - c]      = piece(0, c, c, bw - c, (mw, c))             # stretched runs
        o[nh - c:, c:nw - c] = piece(bh - c, bh, c, bw - c, (mw, c))
        o[c:nh - c, :c]      = piece(c, bh - c, 0, c, (c, mh))
        o[c:nh - c, nw - c:] = piece(c, bh - c, bw - c, bw, (c, mh))
        return o                                   # the middle stays empty

    base = a.copy()
    base[by0:by1 + 1, bx0:bx1 + 1] = 0             # erase the old border

    def gaps(arr, x0, w):
        """gap above and below the screen on the COMPOSED image, median over
           the columns the eye actually reads"""
        ink2 = arr[..., 3] > 128
        ab, be = [], []
        for x in np.linspace(x0 + w * 0.25, x0 + w * 0.75, 21).astype(int):
            col2 = ink2[:, x]
            r, i = [], 0
            while i < len(col2):
                if col2[i]:
                    j = i
                    while j < len(col2) and col2[j]:
                        j += 1
                    r.append((i, j - 1)); i = j
                else:
                    i += 1
            if len(r) >= 4:
                ab.append(r[1][0] - r[0][1] - 1)
                be.append(r[3][0] - r[2][1] - 1)
        return (int(np.median(ab)), int(np.median(be))) if ab else (None, None)

    def settle(o, nh, x0):
        """vertical placement, measured rather than estimated: place, read the
           two gaps off the composed image, shift by half the difference"""
        inner = o[:, int(nw * 0.20):int(nw * 0.80), 3] > 0
        tops, bots = [], []
        for cc in range(inner.shape[1]):
            nz = np.nonzero(inner[:, cc])[0]
            if nz.size:
                tops.append(nz[0]); bots.append(nz[-1])
        must(tops, "the grown screen block has no ink in its middle columns")
        ny = int(round((py0 + py1 - int(np.median(tops)) - int(np.median(bots))) / 2))
        keep = o[..., 3] > 0
        ga = gb = None
        for _ in range(8):
            arr = base.copy()
            arr[ny:ny + nh, x0:x0 + nw][keep] = o[keep]
            ga, gb = gaps(arr, x0, nw)
            if ga is None or abs(ga - gb) <= 1:
                break
            ny += (gb - ga) // 2
        return ny, ga, gb

    nx0 = (px0 + px1) // 2 - nw // 2

    # CLEARANCE IS MEASURED AT THE CORNERS, because that is where it binds.
    #
    # The lid is drawn with round corners and the screen is not, so there was
    # 43px of gap along every straight run while the corners sat right on the
    # ink -- exactly what Laffy saw, and something an edge-to-edge measurement
    # can never catch, since the distance that matters there is diagonal.
    #
    # Minimum distance from the screen's ink to any other ink, over the whole
    # shape. Shrink until it clears MARGIN. Nobody picks a number; the drawing
    # decides how big its own screen can be.
    room_h = (py1 - MARGIN) - (py0 + MARGIN) + 1
    nh = min(room_h, int(round(bh * GROW_H)))
    must(nh > 2 * CORNER, "grown block is smaller than its own corners")

    chosen = None
    while nh > bh * 0.80:
        o = slice9(nh)
        ny0, g_above, g_below = settle(o, nh, nx0)
        clear = int(dist[ny0:ny0 + nh, nx0:nx0 + nw][o[..., 3] > 0].min())
        if clear >= CLEAR_MIN:
            chosen = (nh, o, ny0, clear, g_above, g_below)
            break
        nh -= 8
    must(chosen is not None, "no size of screen clears the lid")
    nh, out, ny0, clear, g_above, g_below = chosen
    must(nx0 >= px0 and nx0 + nw <= px1, "the grown screen is wider than the panel")

    a = base.copy()
    a[ny0:ny0 + nh, nx0:nx0 + nw][out[..., 3] > 0] = out[out[..., 3] > 0]
    print(f"  tightest clearance to the lid: {clear}px (min {CLEAR_MIN}) -- corners included")
    print(f"  gap above the screen {g_above}px, below {g_below}px")

    Image.fromarray(a).save(OUT)
    print(f"  screen {sx1-sx0+1}x{sy1-sy0+1}  ->  {nw-2*PAD}x{nh-2*PAD}"
          f"   ({GROW_W:.2f}x wide, {GROW_H:.2f}x tall, {GROW_W*GROW_H:.2f}x area)")
    print(f"  panel interior {px1-px0+1}x{py1-py0+1}, margin left: "
          f"{nx0-px0}px left, {px1-(nx0+nw)}px right, {ny0-py0}px top, {py1-(ny0+nh)}px bottom")
    print(f"  wrote {OUT.name}")
    print(f"  next: python3 build/trace_screen.py")


if __name__ == "__main__":
    main()
