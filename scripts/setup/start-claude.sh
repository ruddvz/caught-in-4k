#!/bin/bash
# ============================================================
# Caught in 4K — Claude Code Launcher with Token Optimization
# Starts Headroom proxy, verifies healthy, then opens CC
# For macOS / Linux / WSL
# ============================================================

set -e

HEADROOM_PORT=8787
HEADROOM_HEALTH="http://127.0.0.1:${HEADROOM_PORT}/health"
MAX_WAIT=10

echo ""
echo "Caught in 4K - Claude Code Launcher"
echo "====================================="

# ── Start Headroom in background ──────────────────────────
echo "[1/3] Starting Headroom proxy on port ${HEADROOM_PORT}..."

if curl -s "${HEADROOM_HEALTH}" 2>/dev/null | grep -q "healthy"; then
  echo "[ok]   Headroom already running"
else
  headroom proxy --port "${HEADROOM_PORT}" &
  HEADROOM_PID=$!

  WAITED=0
  while [[ $WAITED -lt $MAX_WAIT ]]; do
    sleep 1
    WAITED=$((WAITED + 1))
    if curl -s "${HEADROOM_HEALTH}" 2>/dev/null | grep -q "healthy"; then
      echo "[ok]   Headroom healthy at ${HEADROOM_HEALTH}"
      export ANTHROPIC_BASE_URL="http://127.0.0.1:${HEADROOM_PORT}"
      break
    fi
  done

  if [[ $WAITED -ge $MAX_WAIT ]]; then
    echo "[warn] Headroom did not start in time - proceeding without it"
  fi
fi

# ── RTK telemetry off ─────────────────────────────────────
echo "[2/3] Configuring RTK..."
export RTK_TELEMETRY_DISABLED=1
echo "[ok]   RTK telemetry disabled"

# ── Launch Claude Code ────────────────────────────────────
echo "[3/3] Launching Claude Code..."
echo ""
echo "Active optimizations:"
command -v rtk &>/dev/null && echo "  RTK      - shell output compression (60-90% savings)"
[[ -n "${ANTHROPIC_BASE_URL:-}" ]] && echo "  Headroom - API traffic compression (~34% savings)"
echo "  MemStack - persistent session memory"
echo ""

claude

# ── Show stats on exit ────────────────────────────────────
echo ""
echo "Session complete. Token savings summary:"
curl -s "http://127.0.0.1:${HEADROOM_PORT}/stats" 2>/dev/null && echo "" || echo "(Headroom not running)"
command -v rtk &>/dev/null && rtk gain 2>/dev/null || echo "(RTK stats not available)"
