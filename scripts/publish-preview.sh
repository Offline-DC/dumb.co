#!/usr/bin/env bash
# Builds the site and publishes it to the preview,
# https://offline-dc.github.io/dumb.co-redesign-preview/
#
#   bash scripts/publish-preview.sh                 # build, commit, push
#   bash scripts/publish-preview.sh --no-push       # build and commit only
#
# Needs a clone of Offline-DC/dumb.co-redesign-preview next to this repo
# (../dumb.co-redesign-preview), or PREVIEW_DIR=/path/to/it. Once the deploy
# key in .github/workflows/redesign-preview.yml is set up, pushing
# dumb.co_redesign_v1 does all of this by itself and you won't need this.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PREVIEW_DIR="${PREVIEW_DIR:-$HERE/../dumb.co-redesign-preview}"
PUSH=1; [ "${1:-}" = "--no-push" ] && PUSH=""

die() { echo "publish-preview: $*" >&2; exit 1; }
[ -d "$PREVIEW_DIR/.git" ] || die "no preview clone at $PREVIEW_DIR (git clone git@github.com:Offline-DC/dumb.co-redesign-preview.git there, or set PREVIEW_DIR)"
node -e 'const [a,b]=process.versions.node.split(".").map(Number); process.exit(a>22||(a===22&&b>=12)?0:1)' \
  || die "Astro needs Node 22.12 or newer (you have $(node -v))"

cd "$HERE"
SHA="$(git rev-parse --short HEAD)"; BRANCH="$(git rev-parse --abbrev-ref HEAD)"
DIRTY=""; git diff --quiet HEAD 2>/dev/null || DIRTY=" (+uncommitted changes)"

echo "==> building $BRANCH @ $SHA$DIRTY for the preview"
npm ci --no-audit --no-fund >/dev/null
SITE_URL=https://offline-dc.github.io npm run build:preview >/dev/null

# same as the GitHub workflow: no big downloads, never indexed
touch dist/.nojekyll
find dist -type f -size +5M -delete
printf 'User-agent: *\nDisallow: /\n' > dist/robots.txt
printf 'what   : dumb.co new site, preview\nbranch : %s\ncommit : %s%s\nbuilt  : %s\n' \
  "$BRANCH" "$SHA" "$DIRTY" "$(date -u '+%Y-%m-%d %H:%M UTC')" > dist/PREVIEW.txt

echo "==> copying into $PREVIEW_DIR"
cd "$PREVIEW_DIR"
git checkout -q gh-pages
git pull -q --ff-only 2>/dev/null || true
find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R "$HERE/dist/." .
git add -A
if git diff --cached --quiet; then echo "    nothing changed"; exit 0; fi
git commit -qm "preview: $BRANCH @ $SHA$DIRTY"
if [ -n "$PUSH" ]; then
  git push -q origin gh-pages
  echo "==> live in a minute or two: https://offline-dc.github.io/dumb.co-redesign-preview/"
else
  echo "==> committed, not pushed (cd $PREVIEW_DIR && git push origin gh-pages)"
fi
