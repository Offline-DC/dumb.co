#!/usr/bin/env bash
# Asks a site for every route in scripts/routes.mjs and prints the status code.
# 200 = a real page. 404 = the crawler is told the page does not exist.
#
#   bash redesign_2026/build/check_routes.sh                      # the live site
#   bash redesign_2026/build/check_routes.sh http://localhost:8000  # a local build
#
# For the local check, serve dist/ with a plain static server:
#
#   npm run build
#   python3 -m http.server 8000 -d dist
#
# Do NOT test with `npm start` — that's `serve -s dist`, and the -s flag
# rewrites every unknown path to index.html, so everything answers 200 whether
# the route exists or not. python3's server behaves like GitHub Pages does.
set -uo pipefail

BASE="${1:-https://dumb.co}"
BASE="${BASE%/}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP="$(cd "$HERE/.." && pwd)"
[ -f "$APP/scripts/routes.mjs" ] || APP="$(cd "$HERE/../dumb.co" && pwd)"
ROUTES_FILE="$APP/scripts/routes.mjs"

if [ ! -f "$ROUTES_FILE" ]; then
  echo "can't find scripts/routes.mjs (looked in $APP)" >&2
  exit 1
fi

# the route list, plus the two files the prerender step generates
PATHS=$(grep -oE 'path: *"[^"]+"' "$ROUTES_FILE" | sed 's/.*"\(.*\)"/\1/')
PATHS="$PATHS
/robots.txt
/sitemap.xml"

echo
echo "  $BASE"
echo
ok=0; bad=0
while IFS= read -r p; do
  [ -z "$p" ] && continue
  # -L follows a redirect: a static server may send /press to /press/ , which
  # is fine. What matters is where it lands.
  read -r first final <<<"$(curl -sSL -m 15 -o /dev/null \
      -w "%{response_code} %{http_code}" "$BASE$p" 2>/dev/null || echo "--- ---")"
  note=""
  [ "$first" != "$final" ] && note="  (via $first)"
  case "$final" in
    200) mark="ok  "; ok=$((ok+1)) ;;
    *)   mark="FAIL"; bad=$((bad+1)) ;;
  esac
  printf "  %s  %-16s %s%s\n" "$mark" "$p" "$final" "$note"
done <<< "$PATHS"

echo
if [ "$bad" -eq 0 ]; then
  echo "  all $ok reachable"
else
  echo "  $ok ok, $bad not reachable — a 404 here means search engines are told"
  echo "  the page doesn't exist, however well it renders in a browser"
fi
echo
[ "$bad" -eq 0 ]
