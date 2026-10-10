#!/usr/bin/env python3
"""
Re-downloads the published reviews sheet into assets/reviews_snapshot.csv.

Same shape as refresh_faq_snapshot.py: the shop page renders this snapshot
instantly with no network, then tries the live sheet and replaces it if that
works. Run whenever the sheet changes, then rebuild:

    python3 build/refresh_reviews_snapshot.py
    python3 build/build.py

Until REVIEWS_CSV_URL is filled in, this does nothing and says so -- the
snapshot committed in assets/ is the five reviews the Places API returns, and
those render fine on their own.

Columns:
    show          yes/no, so a review can be hidden without deleting it
    order         display order in the rail
    name          reviewer; blank falls back to "via Google"
    meta          the line under the name, e.g. "dumbphone 2 - 5 months"
    stars         1-5
    body          the review text
    avg_rating    row 1 only: the profile's average, e.g. 5.0
    review_count  row 1 only: the profile's total, e.g. 37

avg_rating and review_count describe the whole Business Profile rather than
any one row, which is why they only live on the first one. The rail shows at
most five reviews (that is the Places API ceiling); the count is what tells a
visitor there are more.
"""
import csv, io, pathlib, sys, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT  = ROOT / "assets" / "reviews_snapshot.csv"

# File > Share > Publish to web > CSV, then paste the URL here and in
# build/parts/31_reviews.js so the built page can fetch the live one too.
REVIEWS_CSV_URL = ""

EXPECTED = ["show", "order", "name", "meta", "stars", "body"]


def main():
    if not REVIEWS_CSV_URL:
        sys.exit("REVIEWS_CSV_URL isn't set yet - publish the sheet, paste the URL "
                 f"into this script, and re-run. {OUT.name} is unchanged.")
    try:
        with urllib.request.urlopen(REVIEWS_CSV_URL, timeout=30) as r:
            text = r.read().decode("utf-8")
    except Exception as e:
        sys.exit(f"couldn't reach the sheet ({e}) - leaving {OUT.name} as it is")

    rows = list(csv.reader(io.StringIO(text)))
    if not rows:
        sys.exit(f"the sheet came back empty - leaving {OUT.name} as it is")

    head = [c.strip().lower() for c in rows[0]]
    missing = [c for c in EXPECTED if c not in head]
    if missing:
        sys.exit(f"the sheet is missing column(s): {', '.join(missing)} - "
                 f"leaving {OUT.name} as it is")

    body = [r for r in rows[1:] if r and any(c.strip() for c in r)]
    if not body:
        sys.exit(f"no review rows in the sheet - leaving {OUT.name} as it is")

    OUT.write_text(text, encoding="utf-8")
    shown = sum(1 for r in body
                if (r[head.index("show")].strip().lower() or "yes") != "no")
    print(f"  wrote {OUT.name}: {len(body)} row(s), {shown} shown")
    print(f"  next: python3 build/build.py")


if __name__ == "__main__":
    main()
