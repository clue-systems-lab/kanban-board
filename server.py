#!/usr/bin/env python3
import argparse
import json
import os
from http.server import SimpleHTTPRequestHandler, HTTPServer

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
BOARD_PATH = os.path.join(BASE_DIR, 'board.json')

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api/board'):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            with open(BOARD_PATH, 'r', encoding='utf-8') as f:
                self.wfile.write(f.read().encode('utf-8'))
            return
        return super().do_GET()

    def do_POST(self):
        if self.path.startswith('/api/board'):
            length = int(self.headers.get('Content-Length', '0'))
            data = self.rfile.read(length).decode('utf-8')
            try:
                payload = json.loads(data)
            except json.JSONDecodeError:
                self.send_response(400)
                self.end_headers()
                return
            # Update timestamp
            if isinstance(payload, dict) and 'meta' in payload:
                payload['meta']['updated'] = payload['meta'].get('updated', '')
            with open(BOARD_PATH, 'w', encoding='utf-8') as f:
                json.dump(payload, f, indent=2)
            self.send_response(200)
            self.end_headers()
            return
        self.send_response(404)
        self.end_headers()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--bind', default='127.0.0.1', help='Bind address (use Tailscale IP for remote access)')
    parser.add_argument('--port', type=int, default=8787)
    args = parser.parse_args()

    os.chdir(BASE_DIR)
    httpd = HTTPServer((args.bind, args.port), Handler)
    print(f"Serving board at http://{args.bind}:{args.port}")
    httpd.serve_forever()


if __name__ == '__main__':
    main()
