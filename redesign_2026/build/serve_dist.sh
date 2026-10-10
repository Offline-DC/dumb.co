#!/usr/bin/env bash
# Serves dist/ the way GitHub Pages would — a plain static server, no SPA
# rewrite — so check_routes.sh can tell a real page from a missing one.
#
#   npm run serve:dist          # port 8000
#   bash redesign_2026/build/serve_dist.sh 8010
#
# If the port is already taken it says so and stops, instead of throwing
# python's "Address already in use" traceback: an already-running server is
# usually the one you started in another tab, and it's already doing the job.
set -uo pipefail

PORT="${1:-8000}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP="$(cd "$HERE/.." && pwd)"
[ -f "$APP/package.json" ] || APP="$(cd "$HERE/../dumb.co" && pwd)"

if [ ! -d "$APP/dist" ]; then
  echo
  echo "  no dist/ to serve yet — build it first:"
  echo "     npm run build"
  echo
  exit 1
fi

in_use() {
  python3 - "$1" <<'PY'
import socket, sys
s = socket.socket()
s.settimeout(0.4)
sys.exit(0 if s.connect_ex(("127.0.0.1", int(sys.argv[1]))) == 0 else 1)
PY
}

if in_use "$PORT"; then
  echo
  echo "  port $PORT is already serving something — leaving it alone."
  if command -v lsof >/dev/null 2>&1; then
    echo
    lsof -nP -iTCP:"$PORT" -sTCP:LISTEN 2>/dev/null | sed 's/^/    /'
  fi
  echo
  echo "  if that's a serve:dist from another tab, it is already serving dist/ and"
  echo "  you can go straight to:"
  echo "     npm run check:routes:local"
  echo
  echo "  to stop it:            kill \$(lsof -ti tcp:$PORT)"
  echo "  or use another port:   bash redesign_2026/build/serve_dist.sh 8010"
  echo "                         npm run check:routes -- http://localhost:8010"
  echo
  exit 0
fi

echo
echo "  serving $APP/dist on http://localhost:$PORT"
echo "  in another tab:  npm run check:routes:local"
echo "  ctrl-c to stop"
echo
exec python3 -m http.server "$PORT" -d "$APP/dist"
