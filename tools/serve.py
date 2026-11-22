#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LUXE INTIMO - tiny local static server.

Serves the project folder over http://localhost so the app runs in a
secure context (WebCrypto / localStorage / service-worker ready).

  python tools/serve.py         -> picks the first free port from 8080
  python tools/serve.py 8080    -> uses port 8080 explicitly

No dependencies. No build step.
"""
from __future__ import print_function

import os
import socket
import sys
import threading

try:
    from functools import partial
    from http.server import SimpleHTTPRequestHandler
except ImportError:  # Python 2
    from functools import partial
    from BaseHTTPServer import SimpleHTTPRequestHandler

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def find_free_port(start=8080, end=8120):
    for port in range(start, end):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            sock.bind(("127.0.0.1", port))
            sock.close()
            return port
        except OSError:
            try:
                sock.close()
            except Exception:
                pass
    sys.exit("No free port found between %d and %d." % (start, end))


class Handler(SimpleHTTPRequestHandler):
    """Static server that always hands over the newest bytes.

    Without this the browser caches assets aggressively and you end up
    editing a file that never changes on screen — the single most confusing
    thing about a no-build-step site like this one.
    """

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        SimpleHTTPRequestHandler.end_headers(self)

    def log_message(self, fmt, *args):
        sys.stdout.write("  %s\n" % (fmt % args))
        sys.stdout.flush()


def build_server(port):
    handler = partial(Handler, directory=ROOT)
    try:
        from http.server import ThreadingHTTPServer
        return ThreadingHTTPServer(("127.0.0.1", port), handler)
    except ImportError:
        from http.server import HTTPServer
        return HTTPServer(("127.0.0.1", port), handler)


def open_browser(url):
    try:
        import webbrowser
        webbrowser.open(url)
    except Exception:
        pass


def main():
    port = None
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            sys.exit("Usage: python tools/serve.py [port]")
    if port is None:
        port = find_free_port()

    try:
        httpd = build_server(port)
    except OSError as exc:
        sys.exit("Could not bind port %d (%s). Try: python tools/serve.py %d"
                 % (port, exc, port + 1))

    url = "http://localhost:%d/" % port

    print("")
    print("   ==================================================")
    print("    LUXE INTIMO  -  local server")
    print("   ==================================================")
    print("    URL      :  %s" % url)
    print("    Folder   :  %s" % ROOT)
    print("    Stop     :  press Ctrl+C")
    print("   ==================================================")
    print("")

    threading.Timer(0.9, lambda: open_browser(url)).start()

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n   Stopped. Thank you for testing LUXE INTIMO.")
        try:
            httpd.server_close()
        except Exception:
            pass


if __name__ == "__main__":
    main()