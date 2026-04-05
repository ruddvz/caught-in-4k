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
node -e "const [major] = process.versions.node.split('.').map(Number); process.exit(major >= 20 ? 0 : 1)"
if errorlevel 1 (
    echo.
    echo X Node.js 20 is required for this repo.
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo.
    echo X npm install failed. Fix the error above and run this script again.
    pause
    exit /b 1
)

echo.
echo [OK] Setup Complete!
echo.
echo [NEXT STEPS]
echo.
echo Window 1 - React App:
echo   npm start
echo.
echo Optional Gemini fallback:
echo   1. Add GEMINI_API_KEY to .env
echo   2. Run node api-proxy.js in a second window
echo   3. Set REACT_APP_CANON_PROXY_URL before restarting npm start
echo.
echo Then open: https://localhost:8080/
echo.
pause
