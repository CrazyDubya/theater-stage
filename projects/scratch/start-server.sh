#!/bin/bash

# Start HTTP server for 3D Theater Stage project
# Run this in a separate terminal window to keep server running

cd /Users/pup/claude-workspace/projects/scratch

echo "🚀 Starting HTTP server on port 8000..."
echo "📁 Serving from: $(pwd)"
echo "🌐 Access at: http://localhost:8000"
echo "📋 Site map: http://localhost:8000/sitemap.html"
echo ""
echo "Press Ctrl+C to stop server"
echo "========================="

python3 -m http.server 8000