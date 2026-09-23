#!/usr/bin/env bash
# Dev server: serves concept/ AND rebuilds whenever a source file changes, so
# you edit build/parts/* and just reload the page.
#
#   bash build/dev.sh          # port 8010
#   bash build/dev.sh 3000
#
# ctrl-c stops both. Watches build/parts, build/*.py and concept/v6_baseline.html.
# It does NOT watch assets/ -- a new drawing needs its own step first
# (make_dpad_arrows.py, expand_screen.py, trace_screen.py), and guessing which
# would be worse than making you type it.
set -euo pipefail

PORT="${1:-8010}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$HERE"

command -v python3 >/dev/null || { echo "python3 not found" >&2; exit 1; }

stamp() {
  find build/parts build/*.py concept/v6_baseline.html -type f \
       -exec stat -f '%m %N' {} + 2>/dev/null \
    || find build/parts build/*.py concept/v6_baseline.html -type f \
       -exec stat -c '%Y %n' {} + 2>/dev/null
}

echo "==> first build"
python3 build/build.py | tail -1

IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
echo
echo "  on this mac:  http://localhost:$PORT/index.html"
[ -n "$IP" ] && echo "  on your phone: http://$IP:$PORT/index.html"
echo "  watching build/parts + build/*.py — edit, save, reload. ctrl-c to stop."
echo

python3 -m http.server "$PORT" -d "$HERE/concept" --bind 0.0.0.0 >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true; echo; echo "stopped."; exit 0' INT TERM

LAST="$(stamp | sort | md5 2>/dev/null || stamp | sort | md5sum)"
while true; do
  sleep 1
  NOW="$(stamp | sort | md5 2>/dev/null || stamp | sort | md5sum)"
  if [ "$NOW" != "$LAST" ]; then
    LAST="$NOW"
    printf '  %s  rebuilding... ' "$(date +%H:%M:%S)"
    if OUT="$(python3 build/build.py 2>&1)"; then
      echo "$OUT" | tail -1 | sed 's/^ *//'
    else
      echo; echo "$OUT" | tail -3 | sed 's/^/     /'   # keep serving the last good build
    fi
  fi
done
