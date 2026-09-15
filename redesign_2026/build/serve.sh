#!/usr/bin/env bash
# Serves concept/ on the local network so the mobile builds can be opened on a
# real phone, and prints the URLs to type in. Ctrl-C to stop.
#
#   bash build/serve.sh          # port 8000
#   bash build/serve.sh 8080
set -euo pipefail

PORT="${1:-8000}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ ! -f "$HERE/concept/index.html" ]; then
  echo "concept/index.html is missing — run: python3 build/build.py" >&2
  exit 1
fi
# mobile-new.html is gone: the redesign is one responsive page now, so
# index.html IS the mobile build -- just open it narrow. mobile-current.html is
# still built separately (it mirrors today's live site) and is optional.

# the Wi-Fi address, not the loopback one
IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
if [ -z "$IP" ]; then
  IP="$(ifconfig 2>/dev/null | awk '/inet /{if ($2 != "127.0.0.1") {print $2; exit}}' || true)"
fi

echo
echo "  serving $HERE/concept on port $PORT"
echo
echo "  on this mac:"
echo "    http://localhost:$PORT/index.html            the redesign"
echo "    http://localhost:$PORT/mobile-current.html   today's live site, for comparison"
echo
echo "  same file for desktop and phone — drag the window narrower than 760px"
echo "  and it becomes the handset."
if [ -n "$IP" ]; then
  echo
  echo "  on your phone (same wifi — type this in Safari/Chrome):"
  echo "    http://$IP:$PORT/index.html"
else
  echo
  echo "  couldn't read a wifi address — check System Settings > Network for this"
  echo "  mac's IP and use http://<that-ip>:$PORT/index.html on the phone"
fi
echo
echo "  a section links straight in, e.g.  http://${IP:-localhost}:$PORT/index.html#/shop"
echo "  ctrl-c to stop"
echo

exec python3 -m http.server "$PORT" -d "$HERE/concept" --bind 0.0.0.0
