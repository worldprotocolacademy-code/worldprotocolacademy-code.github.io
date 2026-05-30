#!/usr/bin/env bash
# WPA local server — Mac / Linux
cd "$(dirname "$0")"
echo "WPA local server starting at http://localhost:8080/index.html"
echo "Press Ctrl+C to stop."
python3 -m http.server 8080
