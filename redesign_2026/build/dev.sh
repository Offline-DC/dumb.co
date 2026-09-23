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

# Which python3. macOS ships a Homebrew python3 that refuses `pip install`
# outright (PEP 668 "externally-managed-environment"), so the sane place for
# Pillow is a venv in .venv/. If one is there we use it automatically -- you
# never have to remember to `source` anything.
if [ -x "$HERE/.venv/bin/python3" ]; then
  PY="$HERE/.venv/bin/python3"
else
  PY="$(command -v python3 || true)"
fi
[ -n "$PY" ] || { echo "python3 not found" >&2; exit 1; }

# build.py needs Pillow. Say so plainly rather than letting it throw an import
# traceback halfway through a build -- the first time this ran on a laptop
# rather than a container, that traceback was the whole error message.
if ! "$PY" -c "import PIL" 2>/dev/null; then
  cat >&2 <<'MSG'
Pillow isn't installed for this python3, and build.py needs it.

Make a venv in this folder once, and dev.sh will find it by itself from then
on -- no activating, no --break-system-packages, nothing installed globally:

    python3 -m venv .venv
    .venv/bin/pip install Pillow

Only needed for the build. The art scripts (trace_screen.py, expand_screen.py)
also want numpy and opencv-python, but you only run those when a drawing
changes:

    .venv/bin/pip install numpy opencv-python
MSG
  exit 1
fi

stamp() {
  find build/parts build/*.py concept/v6_baseline.html -type f \
       -exec stat -f '%m %N' {} + 2>/dev/null \
    || find build/parts build/*.py concept/v6_baseline.html -type f \
       -exec stat -c '%Y %n' {} + 2>/dev/null
}

echo "==> first build"
"$PY" build/build.py | tail -1

IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
echo
echo "  on this mac:  http://localhost:$PORT/index.html"
[ -n "$IP" ] && echo "  on your phone: http://$IP:$PORT/index.html"
echo "  watching build/parts + build/*.py — edit, save, reload. ctrl-c to stop."
echo

"$PY" -m http.server "$PORT" -d "$HERE/concept" --bind 0.0.0.0 >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true; echo; echo "stopped."; exit 0' INT TERM

LAST="$(stamp | sort | md5 2>/dev/null || stamp | sort | md5sum)"
while true; do
  sleep 1
  NOW="$(stamp | sort | md5 2>/dev/null || stamp | sort | md5sum)"
  if [ "$NOW" != "$LAST" ]; then
    LAST="$NOW"
    printf '  %s  rebuilding... ' "$(date +%H:%M:%S)"
    if OUT="$("$PY" build/build.py 2>&1)"; then
      echo "$OUT" | tail -1 | sed 's/^ *//'
    else
      echo; echo "$OUT" | tail -3 | sed 's/^/     /'   # keep serving the last good build
    fi
  fi
done
