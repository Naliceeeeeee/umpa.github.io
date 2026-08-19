@echo off
cd /d "%~dp0"
echo.
echo  UMPA website — local preview
echo  ===========================
echo  Open in your browser:
echo    http://127.0.0.1:8080/contact.html
echo    http://127.0.0.1:8080/index.html
echo.
echo  Press Ctrl+C to stop the server.
echo.
python -m http.server 8080
if errorlevel 1 (
  echo Python not found. Install Python 
  pause
)
