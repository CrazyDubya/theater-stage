#!/usr/bin/env python3
"""
Simple HTTP server for testing texture generation system
Serves files from the current directory with proper CORS headers
"""

import http.server
import socketserver
import os
import sys
from urllib.parse import urlparse

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def main():
    port = 8080
    
    # Change to the script's directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    print(f"🌐 Starting HTTP server on port {port}")
    print(f"📁 Serving files from: {os.getcwd()}")
    print(f"🔗 Open: http://localhost:{port}/test/texture-system-test.html")
    print("   Press Ctrl+C to stop")
    
    try:
        with socketserver.TCPServer(("", port), CORSHTTPRequestHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {port} is already in use")
            print("   Try: lsof -ti:8080 | xargs kill")
        else:
            print(f"❌ Server error: {e}")

if __name__ == "__main__":
    main()