@echo off
REM WPA local server — Windows
cd /d "%~dp0"
echo WPA local server starting at http://localhost:8080/index.html
echo Press Ctrl+C to stop.
py -m http.server 8080 || python -m http.server 8080
pause
