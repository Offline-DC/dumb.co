#!/usr/bin/env python3
"""
Serves concept/ the way GitHub Pages serves the preview: a path that is not a
file (/shop, /about, /dumb.co-redesign-preview/faq) gets index.html back
instead of a 404, so the redesign's real-path routes survive a reload.

`python3 -m http.server` can't do this -- it answers /shop with its own 404
page -- which is why serve.sh and dev.sh use this instead.

    python3 build/spa_server.py 8010                  # serves concept/
    python3 build/spa_server.py 8010 --dir some/dir
"""
import argparse, http.server, os, pathlib, socketserver

ap = argparse.ArgumentParser()
ap.add_argument("port", nargs="?", type=int, default=8000)
ap.add_argument("--dir", default=str(pathlib.Path(__file__).resolve().parent.parent / "concept"))
ap.add_argument("--bind", default="0.0.0.0")
args = ap.parse_args()
ROOT = os.path.abspath(args.dir)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def send_head(self):
        path = self.translate_path(self.path)
        # a real file, or a directory with an index: serve it as usual
        if os.path.isfile(path) or os.path.isfile(os.path.join(path, "index.html")):
            return super().send_head()
        # anything with an extension really is missing (a typo'd .png should
        # 404, not quietly come back as the whole site)
        if os.path.splitext(self.path.split("?")[0])[1]:
            return super().send_head()
        self.path = "/index.html"
        return super().send_head()


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


if __name__ == "__main__":
    with Server((args.bind, args.port), Handler) as httpd:
        httpd.serve_forever()
