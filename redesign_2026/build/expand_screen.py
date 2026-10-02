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
MARGIN  = 26     # body left showing around the screen inside the panel
# Measured against the panel the script finds (x[173,1050] y[75,1641]): the
# block is the aperture plus PAD either side, 831x1327. Horizontally that
# leaves 7px once the margins are taken, so the screen is already as wide as
# the lid allows and 1.00 is the honest number rather than a wish. The room
# is vertical, and nearly all of it is ABOVE the screen.
GROW_W  = 1.00
GROW_H  = 1.13


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

    col = ink[:, (sx0 + sx1) // 2]
    row = ink[(sy0 + sy1) // 2, :]
    cy, cx = (sy0 + sy1) // 2, (sx0 + sx1) // 2
    py0 = panel_edge(col, cy, -1)
    py1 = panel_edge(col, cy, +1)
    px0 = panel_edge(row, cx, -1)
    px1 = panel_edge(row, cx, +1)
    must(None not in (px0, px1, py0, py1),
         "couldn't find the lid's stroke on all four sides of the screen")
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

    nw, nh = int(round(bw * GROW_W)), int(round(bh * GROW_H))
    room_w = (px1 - MARGIN) - (px0 + MARGIN) + 1
    room_h = (py1 - MARGIN) - (py0 + MARGIN) + 1
    must(nw <= room_w, f"new screen {nw}px wide, only {room_w}px of panel to put it in")
    must(nh <= room_h, f"new screen {nh}px tall, only {room_h}px of panel to put it in")
    must(nw > 2 * CORNER and nh > 2 * CORNER, "grown block is smaller than its own corners")

    block = a[by0:by1 + 1, bx0:bx1 + 1]

    def piece(y0, y1, x0, x1, size):
        p = Image.fromarray(block[y0:y1, x0:x1])
        return np.array(p.resize(size, Image.LANCZOS)) if size != (x1 - x0, y1 - y0) else np.array(p)

    c, out = CORNER, np.zeros((nh, nw, 4), np.uint8)
    mw, mh = nw - 2 * c, nh - 2 * c
    out[:c, :c]          = piece(0, c, 0, c, (c, c))                       # corners, 1:1
    out[:c, nw - c:]     = piece(0, c, bw - c, bw, (c, c))
    out[nh - c:, :c]     = piece(bh - c, bh, 0, c, (c, c))
    out[nh - c:, nw - c:] = piece(bh - c, bh, bw - c, bw, (c, c))
    out[:c, c:nw - c]    = piece(0, c, c, bw - c, (mw, c))                 # stretched runs
    out[nh - c:, c:nw - c] = piece(bh - c, bh, c, bw - c, (mw, c))
    out[c:nh - c, :c]    = piece(c, bh - c, 0, c, (c, mh))
    out[c:nh - c, nw - c:] = piece(c, bh - c, bw - c, bw, (c, mh))
    # the middle is the aperture: stays empty

    # centre the new screen in the panel, biased up so it clears the hinge
    cx = (px0 + px1) // 2
    cy = py0 + MARGIN + nh // 2 + 4
    nx0, ny0 = cx - nw // 2, cy - nh // 2
    must(nx0 >= px0 and ny0 >= py0 and nx0 + nw <= px1 and ny0 + nh <= py1,
         "the grown screen doesn't fit where we want to put it")

    a[by0:by1 + 1, bx0:bx1 + 1] = 0          # erase the old border
    tgt = a[ny0:ny0 + nh, nx0:nx0 + nw]
    keep = out[..., 3] > 0                    # paste, don't blend
    tgt[keep] = out[keep]

    Image.fromarray(a).save(OUT)
    print(f"  screen {sx1-sx0+1}x{sy1-sy0+1}  ->  {nw-2*PAD}x{nh-2*PAD}"
          f"   ({GROW_W:.2f}x wide, {GROW_H:.2f}x tall, {GROW_W*GROW_H:.2f}x area)")
    print(f"  panel interior {px1-px0+1}x{py1-py0+1}, margin left: "
          f"{nx0-px0}px left, {px1-(nx0+nw)}px right, {ny0-py0}px top, {py1-(ny0+nh)}px bottom")
    print(f"  wrote {OUT.name}")
    print(f"  next: python3 build/trace_screen.py")


if __name__ == "__main__":
    main()
