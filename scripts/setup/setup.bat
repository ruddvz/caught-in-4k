@echo off
color 0A

echo.
echo 4K Caught in 4K - Installation Script
echo ======================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo X Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

echo [OK] Node.js found: 
node --version

echo.
echo Installing dependencies...
call npm install express cors dotenv

echo.
echo [OK] Setup Complete!
echo.
echo [NEXT STEPS]
echo.
echo Open TWO command windows:
echo.
echo Window 1 - Backend Proxy:
echo   node api-proxy.js
echo.
echo Window 2 - React App:
echo   npm start
echo.
echo Then open: http://localhost:3000
echo.
pause
