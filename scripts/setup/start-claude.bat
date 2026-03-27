@echo off
REM ============================================================
REM Caught in 4K — Claude Code Launcher with Token Optimization
REM Starts Headroom proxy, verifies it's healthy, then opens CC
REM ============================================================

setlocal EnableDelayedExpansion

set HEADROOM_PORT=8787
set HEADROOM_HEALTH=http://127.0.0.1:%HEADROOM_PORT%/health
set MAX_WAIT=10

echo.
echo Caught in 4K - Claude Code Launcher
echo =====================================

REM ── Start Headroom in background ──────────────────────────
echo [1/3] Starting Headroom proxy on port %HEADROOM_PORT%...

REM Check if already running
curl -s -o nul -w "%%{http_code}" %HEADROOM_HEALTH% 2>nul | findstr "200" >nul 2>&1
if %errorlevel% equ 0 (
  echo [ok]   Headroom already running
  goto :rtk_check
)

REM Start Headroom minimized in background
start /min "Headroom Proxy" headroom proxy --port %HEADROOM_PORT%

REM Wait for Headroom to become healthy
set WAITED=0
:wait_loop
timeout /t 1 /nobreak >nul
set /a WAITED+=1
curl -s -o nul -w "%%{http_code}" %HEADROOM_HEALTH% 2>nul | findstr "200" >nul 2>&1
if %errorlevel% equ 0 goto :headroom_ready
if !WAITED! geq %MAX_WAIT% (
  echo [warn] Headroom did not start in time - proceeding without it
  goto :rtk_check
)
goto :wait_loop

:headroom_ready
echo [ok]   Headroom healthy at %HEADROOM_HEALTH%
set ANTHROPIC_BASE_URL=http://127.0.0.1:%HEADROOM_PORT%

:rtk_check
REM ── RTK telemetry off ──────────────────────────────────────
echo [2/3] Configuring RTK...
set RTK_TELEMETRY_DISABLED=1
echo [ok]   RTK telemetry disabled

REM ── Launch Claude Code ─────────────────────────────────────
echo [3/3] Launching Claude Code...
echo.
echo Active optimizations:
where rtk >nul 2>&1 && echo   RTK   - shell output compression (60-90%% savings)
if defined ANTHROPIC_BASE_URL echo   Headroom - API traffic compression (~34%% savings)
echo   MemStack  - persistent session memory
echo.

claude

REM ── Show stats on exit ─────────────────────────────────────
echo.
echo Session complete. Token savings summary:
curl -s http://127.0.0.1:%HEADROOM_PORT%/stats 2>nul && echo. || echo (Headroom not running)
rtk gain 2>nul || echo (RTK stats not available)

endlocal
