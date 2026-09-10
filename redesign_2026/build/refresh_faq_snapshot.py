#!/usr/bin/env python3
"""
Re-downloads the published FAQ sheet into assets/faq_snapshot.csv.

FAQ.exe renders this snapshot instantly with no network, then tries the live
sheet and replaces it if that works. Run this whenever the sheet changes, then
rebuild:

    python3 build/refresh_faq_snapshot.py
    python3 build/build.py

Needs network. If it can't reach the sheet it leaves the existing snapshot
alone rather than truncating it.
"""
import csv, io, pathlib, sys, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "faq_snapshot.csv"
URL = ("https://docs.google.com/spreadsheets/d/e/"
       "2PACX-1vTWuMc1UItkIUZusBTqpN10gkWT0q8RXvxPb6muvfWAUdKCODYkaT5_PUmZMIkbqPBl-K_A2asfTJuB"
       "/pub?output=csv")   # same sheet as src/FAQContent.tsx

try:
    with urllib.request.urlopen(URL, timeout=30) as r:
        text = r.read().decode("utf-8")
except Exception as e:
    sys.exit(f"couldn't reach the sheet ({e}) — leaving {OUT.name} as it is")

rows = list(csv.reader(io.StringIO(text)))
questions = [r for r in rows[1:] if r and r[0].strip()]
if len(questions) < 5:
    sys.exit(f"the sheet came back with only {len(questions)} questions — refusing to overwrite")

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(text, encoding="utf-8")
print(f"  wrote {OUT.relative_to(ROOT)}  ({len(questions)} questions, {len(text):,} chars)")
