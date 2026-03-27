#!/bin/bash
# ============================================================
# Caught in 4K — Token Optimization Stack Setup
# Headroom + RTK + MemStack
# For macOS / Linux / WSL
# ============================================================

set -e

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()    { echo -e "${BOLD}[info]${NC} $1"; }
success() { echo -e "${GREEN}[ok]${NC}   $1"; }
warn()    { echo -e "${YELLOW}[warn]${NC} $1"; }
err()     { echo -e "${RED}[err]${NC}  $1"; exit 1; }

echo ""
echo -e "${BOLD}Caught in 4K — Token Optimization Stack${NC}"
echo "Headroom + RTK + MemStack"
echo "============================================"
echo ""

# ── Prerequisites ──────────────────────────────────────────
info "Checking prerequisites..."

command -v python3 >/dev/null 2>&1 || err "Python 3 is required. Install from https://python.org/downloads/"
command -v pip3 >/dev/null 2>&1 || command -v pip >/dev/null 2>&1 || err "pip is required."
command -v git >/dev/null 2>&1 || err "Git is required."
command -v claude >/dev/null 2>&1 || warn "Claude Code not found on PATH — install from https://docs.anthropic.com/en/docs/claude-code"

success "Prerequisites OK"
echo ""

# ── Step 1: Headroom ───────────────────────────────────────
info "Step 1/3 — Installing Headroom (API proxy, ~34% token savings)..."

PIP_CMD="pip3"
command -v pip3 >/dev/null 2>&1 || PIP_CMD="pip"

$PIP_CMD install --quiet --upgrade "headroom-ai[proxy]"
success "headroom-ai installed: $(python3 -m headroom --version 2>/dev/null || headroom --version 2>/dev/null || echo 'installed')"

# Add ANTHROPIC_BASE_URL to shell profile if not already present
SHELL_RC="$HOME/.bashrc"
[[ "$SHELL" == *"zsh"* ]] && SHELL_RC="$HOME/.zshrc"

if ! grep -q "ANTHROPIC_BASE_URL" "$SHELL_RC" 2>/dev/null; then
  echo '' >> "$SHELL_RC"
  echo '# Headroom proxy for Claude Code (token compression)' >> "$SHELL_RC"
  echo 'export ANTHROPIC_BASE_URL=http://127.0.0.1:8787' >> "$SHELL_RC"
  success "ANTHROPIC_BASE_URL added to $SHELL_RC"
else
  info "ANTHROPIC_BASE_URL already in $SHELL_RC"
fi
echo ""

# ── Step 2: RTK ────────────────────────────────────────────
info "Step 2/3 — Installing RTK (shell output compression, 60-90% savings)..."

if command -v rtk >/dev/null 2>&1; then
  success "RTK already installed: $(rtk --version)"
else
  RTK_VERSION="0.34.0"

  if command -v brew >/dev/null 2>&1; then
    brew install rtk
  else
    # Detect platform
    ARCH=$(uname -m)
    OS=$(uname -s | tr '[:upper:]' '[:lower:]')
    TRIPLE=""

    if [[ "$OS" == "linux" ]]; then
      [[ "$ARCH" == "x86_64" ]] && TRIPLE="x86_64-unknown-linux-musl"
      [[ "$ARCH" == "aarch64" ]] && TRIPLE="aarch64-unknown-linux-musl"
    elif [[ "$OS" == "darwin" ]]; then
      [[ "$ARCH" == "x86_64" ]] && TRIPLE="x86_64-apple-darwin"
      [[ "$ARCH" == "arm64" ]] && TRIPLE="aarch64-apple-darwin"
    fi

    [[ -z "$TRIPLE" ]] && err "Unsupported platform: $OS/$ARCH. Install manually from https://github.com/rtk-ai/rtk/releases"

    RTK_URL="https://github.com/rtk-ai/rtk/releases/download/v${RTK_VERSION}/rtk-${TRIPLE}.tar.gz"
    mkdir -p "$HOME/.local/bin"
    curl -fsSL "$RTK_URL" | tar -xz -C "$HOME/.local/bin"
    chmod +x "$HOME/.local/bin/rtk"
    success "RTK installed to ~/.local/bin/rtk"

    # Add to PATH if needed
    if ! echo "$PATH" | grep -q "$HOME/.local/bin"; then
      echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$SHELL_RC"
      export PATH="$HOME/.local/bin:$PATH"
      success "~/.local/bin added to PATH in $SHELL_RC"
    fi
  fi

  success "RTK installed: $(rtk --version)"
fi

# Opt out of telemetry
if ! grep -q "RTK_TELEMETRY_DISABLED" "$SHELL_RC" 2>/dev/null; then
  echo 'export RTK_TELEMETRY_DISABLED=1' >> "$SHELL_RC"
  success "RTK telemetry disabled"
fi

# Hook RTK into Claude Code global config
rtk init --global --auto-patch 2>/dev/null || warn "RTK init may need manual setup — run: rtk init -g"
echo ""

# ── Step 3: MemStack ───────────────────────────────────────
info "Step 3/3 — Setting up MemStack (persistent session memory)..."

MEMSTACK_DIR="$HOME/tools/memstack"

if [[ -d "$MEMSTACK_DIR/.git" ]]; then
  info "MemStack already cloned — pulling latest..."
  git -C "$MEMSTACK_DIR" pull --quiet
else
  mkdir -p "$HOME/tools"
  git clone --quiet https://github.com/cwinvestments/memstack.git "$MEMSTACK_DIR"
  success "MemStack cloned to $MEMSTACK_DIR"
fi

# Create config if missing
if [[ ! -f "$MEMSTACK_DIR/config.local.json" ]]; then
  REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
  cat > "$MEMSTACK_DIR/config.local.json" << MEMCFG
{
  "version": "3.2.2",
  "author": "$(git config user.name 2>/dev/null || echo 'Developer')",
  "projects": {
    "caught-in-4k": {
      "dir": "$REPO_DIR",
      "claude_md": "$REPO_DIR/CLAUDE.md",
      "deploy_target": "github-pages",
      "repo": "github.com/ruddvz/caught-in-4k"
    }
  },
  "cc_monitor": {
    "api_url": "",
    "api_key": ""
  },
  "headroom": {
    "auto_start": true,
    "port": 8787,
    "health_url": "http://127.0.0.1:8787/health",
    "startup_flags": "",
    "required_extras": ["[proxy]"]
  }
}
MEMCFG
  success "MemStack config.local.json created"
fi

# Init DB
python3 "$MEMSTACK_DIR/db/memstack-db.py" init >/dev/null 2>&1 && success "MemStack database initialized"
echo ""

# ── Done ───────────────────────────────────────────────────
echo -e "${GREEN}${BOLD}All done!${NC}"
echo ""
echo "Reload your shell:  source $SHELL_RC"
echo ""
echo "Start a session with all savings active:"
echo "  headroom proxy --port 8787 &"
echo "  claude"
echo ""
echo "Or use the launcher: bash scripts/setup/start-claude.sh"
echo ""
echo "Check savings:"
echo "  curl http://localhost:8787/stats  # Headroom"
echo "  rtk gain                          # RTK"
echo ""
