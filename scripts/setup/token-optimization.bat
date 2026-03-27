@echo off
REM ============================================================
REM Caught in 4K — Token Optimization Stack Setup
REM Headroom + RTK + MemStack
REM For Windows
REM ============================================================

setlocal EnableDelayedExpansion

echo.
echo Caught in 4K - Token Optimization Stack
echo Headroom + RTK + MemStack
echo ============================================
echo.

REM ── Prerequisites ──────────────────────────────────────────
echo [info] Checking prerequisites...

where python >nul 2>&1 || (echo [err]  Python not found. Install from https://python.org/downloads/ && exit /b 1)
where pip >nul 2>&1 || (echo [err]  pip not found && exit /b 1)
where git >nul 2>&1 || (echo [err]  Git not found. Install from https://git-scm.com/downloads && exit /b 1)

echo [ok]   Prerequisites OK
echo.

REM ── Step 1: Headroom ───────────────────────────────────────
echo [info] Step 1/3 - Installing Headroom (API proxy, ~34%% token savings)...

pip install --quiet --upgrade "headroom-ai[proxy]"
if %errorlevel% neq 0 (
  echo [err]  Headroom install failed
  exit /b 1
)
echo [ok]   headroom-ai installed

REM Set ANTHROPIC_BASE_URL persistently for the user
setx ANTHROPIC_BASE_URL "http://127.0.0.1:8787" >nul 2>&1
echo [ok]   ANTHROPIC_BASE_URL set to http://127.0.0.1:8787 (restart terminal to take effect)
echo.

REM ── Step 2: RTK ────────────────────────────────────────────
echo [info] Step 2/3 - Installing RTK (shell output compression, 60-90%% savings)...

where rtk >nul 2>&1
if %errorlevel% equ 0 (
  echo [ok]   RTK already installed
) else (
  REM Download RTK Windows binary
  set RTK_VERSION=0.34.0
  set RTK_URL=https://github.com/rtk-ai/rtk/releases/download/v!RTK_VERSION!/rtk-x86_64-pc-windows-msvc.zip
  set RTK_DEST=%LOCALAPPDATA%\Programs\rtk

  echo [info] Downloading RTK v!RTK_VERSION!...
  mkdir "!RTK_DEST!" 2>nul
  curl -fsSL "!RTK_URL!" -o "%TEMP%\rtk-windows.zip"
  if %errorlevel% neq 0 (
    echo [err]  RTK download failed
    exit /b 1
  )

  powershell -Command "Expand-Archive -Path '%TEMP%\rtk-windows.zip' -DestinationPath '!RTK_DEST!' -Force"
  echo [ok]   RTK installed to !RTK_DEST!

  REM Add to user PATH
  for /f "skip=2 tokens=3*" %%a in ('reg query "HKCU\Environment" /v PATH 2^>nul') do set "CURRENT_PATH=%%a %%b"
  setx PATH "!CURRENT_PATH!;!RTK_DEST!" >nul 2>&1
  echo [ok]   !RTK_DEST! added to user PATH (restart terminal to take effect)
  set PATH=%PATH%;!RTK_DEST!
)

REM Disable RTK telemetry
setx RTK_TELEMETRY_DISABLED "1" >nul 2>&1
echo [ok]   RTK telemetry disabled

REM Hook RTK into Claude Code via CLAUDE.md (Windows: no hook mode, uses CLAUDE.md injection)
"!RTK_DEST!\rtk.exe" init --global --auto-patch >nul 2>&1 || rtk init --global --auto-patch >nul 2>&1
echo [ok]   RTK instructions injected into global CLAUDE.md
echo.

REM ── Step 3: MemStack ───────────────────────────────────────
echo [info] Step 3/3 - Setting up MemStack (persistent session memory)...

set MEMSTACK_DIR=%USERPROFILE%\tools\memstack

if exist "%MEMSTACK_DIR%\.git" (
  echo [info] MemStack already cloned - pulling latest...
  git -C "%MEMSTACK_DIR%" pull --quiet
) else (
  mkdir "%USERPROFILE%\tools" 2>nul
  git clone --quiet https://github.com/cwinvestments/memstack.git "%MEMSTACK_DIR%"
  echo [ok]   MemStack cloned to %MEMSTACK_DIR%
)

REM Create config if missing
if not exist "%MEMSTACK_DIR%\config.local.json" (
  set REPO_DIR=%~dp0..\..
  (
    echo {
    echo   "version": "3.2.2",
    echo   "author": "Rudra (ruddvz)",
    echo   "projects": {
    echo     "caught-in-4k": {
    echo       "dir": "%~dp0..\\..",
    echo       "claude_md": "%~dp0..\\..\\CLAUDE.md",
    echo       "deploy_target": "github-pages",
    echo       "repo": "github.com/ruddvz/caught-in-4k"
    echo     }
    echo   },
    echo   "cc_monitor": {
    echo     "api_url": "",
    echo     "api_key": ""
    echo   },
    echo   "headroom": {
    echo     "auto_start": true,
    echo     "port": 8787,
    echo     "health_url": "http://127.0.0.1:8787/health",
    echo     "startup_flags": "",
    echo     "required_extras": ["[proxy]"]
    echo   }
    echo }
  ) > "%MEMSTACK_DIR%\config.local.json"
  echo [ok]   MemStack config.local.json created
)

python "%MEMSTACK_DIR%\db\memstack-db.py" init >nul 2>&1
echo [ok]   MemStack database initialized
echo.

REM ── Done ───────────────────────────────────────────────────
echo All done!
echo.
echo IMPORTANT: Restart your terminal for PATH changes to take effect.
echo.
echo Start a session with all savings active:
echo   scripts\setup\start-claude.bat
echo.
echo Or manually:
echo   start "" headroom proxy --port 8787
echo   claude
echo.
echo Check savings:
echo   curl http://localhost:8787/stats
echo   rtk gain
echo.

endlocal
