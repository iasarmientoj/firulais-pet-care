@echo off
title Dev Server - Firulais Pet Care
echo ==========================================================
echo   Starting Local Development Server with Live-Reloading...
echo ==========================================================
echo.
echo [INFO] Press Ctrl+C in this terminal window to stop the server.
echo.
npx -y live-server --port=8080 --host=127.0.0.1
pause
