#!/usr/bin/env bash
# Publish the redesign PROTOTYPE to the preview site, so the team can open it
# on their own phones and laptops.
#
#   cd ~/Desktop/dumb.co_code/redesign-wt/redesign_2026
#   bash build/publish_preview.sh --dry-run    # build + check, push nothing
#   bash build/publish_preview.sh              # for real
#
# This is NOT ../../preview-deploy.sh. That one runs `vite build` against the
# React app at the repo root -- the site that is live TODAY. The prototype is
# static HTML with no package.json of its own, so vite has nothing to build
# here. Running the wrong one is how the team ends up reviewing the old site.
#
# Nothing here touches dumb.co: different repo, different Pages site. The
# prototype uses hash routes (#/shop) and inlines every asset, so unlike the
# vite build there is no --base prefix that can be got wrong -- it works at
# any URL.
set -euo pipefail

# The repo that actually exists. The old default (dumb.co-preview) was a
# guess made before the repo was created, so every publish needed the env
# var spelled out or it failed on a repo that was never there.
PREVIEW_REPO="${PREVIEW_REPO:-git@github.com:Offline-DC/dumb.co-redesign-preview.git}"
REPO_NAME="$(basename "$PREVIEW_REPO" .git)"
OWNER="$(basename "$(dirname "$PREVIEW_REPO")" | sed 's/.*://')"
DRY=""
[ "${1:-}" = "--dry-run" ] && DRY=1

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONCEPT="$HERE/concept"

die() { echo "publish_preview: $*" >&2; exit 1; }

# ---- 1. the build has to exist, and be current -----------------------
[ -f "$CONCEPT/index.html" ] || die "concept/index.html missing -- run: python3 build/build.py"
[ -f "$CONCEPT/quiz.html" ]  || die "concept/quiz.html missing -- run: python3 build/build.py"
[ "$(stat -f%z "$CONCEPT/index.html" 2>/dev/null || stat -c%s "$CONCEPT/index.html")" -gt 1000000 ] \
  || die "concept/index.html is suspiciously small -- half-built?"

NEWEST_PART="$(find "$HERE/build/parts" "$HERE/build/build.py" -type f -newer "$CONCEPT/index.html" 2>/dev/null | head -1 || true)"
[ -z "$NEWEST_PART" ] || die "$(basename "$NEWEST_PART") is newer than the build -- run: python3 build/build.py"

# ---- 2. what the team gets -------------------------------------------
OUT="$(mktemp -d)"
trap 'rm -rf "$OUT"' EXIT
cp "$CONCEPT/index.html" "$OUT/index.html"
cp "$CONCEPT/quiz.html"  "$OUT/quiz.html"
[ -f "$CONCEPT/mobile-current.html" ] && cp "$CONCEPT/mobile-current.html" "$OUT/"
cp "$OUT/index.html" "$OUT/404.html"   # any stray path still renders the site
touch "$OUT/.nojekyll"                 # stop Jekyll eating underscore paths

BRANCH=$(git -C "$HERE" rev-parse --abbrev-ref HEAD)
SHA=$(git -C "$HERE" rev-parse --short HEAD)
DIRTY=""; git -C "$HERE" diff --quiet 2>/dev/null || DIRTY=" (+uncommitted changes)"
cat > "$OUT/PREVIEW.txt" <<TXT
what   : dumb.co 2026 redesign -- PROTOTYPE, not the live site
branch : $BRANCH
commit : $SHA$DIRTY
built  : $(date -u '+%Y-%m-%d %H:%M UTC')
TXT

echo "==> $BRANCH @ $SHA$DIRTY"
for f in "$OUT"/*.html; do
  printf '    %-22s %6.2f MB raw  %6.2f MB gzip\n' "$(basename "$f")" \
    "$(echo "$(wc -c <"$f")/1048576" | bc -l)" "$(echo "$(gzip -9 -c "$f" | wc -c)/1048576" | bc -l)"
done

if [ -n "$DRY" ]; then
  echo; echo "    --dry-run: built and checked, pushed nothing."
  echo "    would publish to: $PREVIEW_REPO"
  echo "    would appear at : https://$(echo "$OWNER" | tr A-Z a-z).github.io/$REPO_NAME/"
  exit 0
fi

# ---- 3. publish -------------------------------------------------------
echo "==> publishing to $PREVIEW_REPO"
cd "$OUT"
git init -q
git checkout -qb gh-pages
git add -A
git -c user.name="Lafayette" -c user.email="laffy@offline.community" \
    commit -qm "preview: redesign prototype $BRANCH @ $SHA"
git push -q --force "$PREVIEW_REPO" gh-pages

echo
echo "    live in ~30s:  https://$(echo "$OWNER" | tr A-Z a-z).github.io/$REPO_NAME/"
echo "    showing:       the redesign prototype, $BRANCH @ $SHA"
