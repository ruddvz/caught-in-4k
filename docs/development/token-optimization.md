# Token Optimization Stack

Three tools that stack together to dramatically reduce token usage in Claude Code sessions.

| Tool | What it compresses | Savings |
|------|-------------------|---------|
| **Headroom** | API traffic between CC and Anthropic | ~34% |
| **RTK** | Shell/CLI output before it hits the context | 60-90% |
| **MemStack** | Eliminates re-reading codebase each session | ~100% on repeat sessions |

---

## Quick Start

### First-time setup

**Windows:**
```bat
scripts\setup\token-optimization.bat
```

**macOS / Linux / WSL:**
```bash
chmod +x scripts/setup/token-optimization.sh
bash scripts/setup/token-optimization.sh
```

### Start a session

**Windows:**
```bat
scripts\setup\start-claude.bat
```

**macOS / Linux:**
```bash
bash scripts/setup/start-claude.sh
```

This starts the Headroom proxy, confirms it's healthy, then launches Claude Code with all optimizations active.

---

## Tool Details

### Headroom

A local proxy (port 8787) that compresses LLM API traffic using AST-aware compression and JSON collapsing before forwarding to Anthropic.

**How it works:**
```
claude → ANTHROPIC_BASE_URL → headroom proxy:8787 → Anthropic API
```

**Manual start:**
```bash
headroom proxy --port 8787
```

**Check savings:**
```bash
curl http://localhost:8787/stats
```

**Permanent activation** — add to your shell profile (`~/.bashrc` / `~/.zshrc`):
```bash
export ANTHROPIC_BASE_URL=http://127.0.0.1:8787
```

On Windows, the setup script calls `setx ANTHROPIC_BASE_URL http://127.0.0.1:8787` which persists it for all future terminal sessions.

> Note: Only set `ANTHROPIC_BASE_URL` when Headroom is running. If the proxy is down and the env var is set, Claude Code will fail to connect.

**Source:** https://github.com/chopratejas/headroom

---

### RTK (Rust Token Killer)

A CLI wrapper that intercepts shell command output and strips noise before Claude Code reads it.

**How it works:**
```
claude → PreToolUse hook → rtk <cmd> → filtered output → claude context
```

On **Windows**, RTK uses CLAUDE.md injection mode (hooks require Unix). The `rtk init --global` command adds instructions to `~/.claude/CLAUDE.md` telling Claude to prefix commands with `rtk`.

**Usage (always prefix with `rtk`):**
```bash
rtk git status      # -90% tokens vs raw output
rtk npm test        # -90% tokens (failures only)
rtk tsc             # -83% tokens (errors grouped by file)
rtk lint            # -84% tokens
rtk playwright test # -94% tokens
```

**Check savings:**
```bash
rtk gain            # Summary
rtk gain --graph    # ASCII chart
rtk gain --history  # Per-command breakdown
```

**Privacy note:** Telemetry is enabled by default. This repo disables it via:
- `.claude/settings.json` → `env.RTK_TELEMETRY_DISABLED = "1"`
- Setup scripts set `RTK_TELEMETRY_DISABLED=1` at the system level

**Source:** https://github.com/rtk-ai/rtk

---

### MemStack

Persistent memory for Claude Code sessions. Stores project context, session history, and task state in a local SQLite database so Claude doesn't re-read the entire codebase at the start of each session.

**Installed at:** `~/tools/memstack/`
**Config:** `~/tools/memstack/config.local.json`
**DB:** `~/tools/memstack/db/memstack.db`

The setup script clones MemStack, creates a `config.local.json` pointing at this project, and initializes the database.

**Source:** https://github.com/cwinvestments/memstack

---

## Expected Savings

| Operation | Without optimization | With RTK | Savings |
|-----------|---------------------|---------|---------|
| `git status` | ~2,000 tokens | ~200 tokens | -90% |
| `npm test` (failures) | ~25,000 tokens | ~2,500 tokens | -90% |
| `git diff` | ~10,000 tokens | ~2,500 tokens | -75% |
| `tsc` output | ~15,000 tokens | ~2,500 tokens | -83% |
| API round-trips (Headroom) | baseline | — | -34% |
| Re-reading codebase (MemStack) | every session | once | -100% |

---

## Troubleshooting

**Headroom not starting:**
```bash
lsof -i :8787          # macOS/Linux: check if port is taken
curl http://localhost:8787/health
```

**RTK not compressing output (Windows):**
- RTK on Windows uses CLAUDE.md mode, not hooks
- Confirm `~/.claude/CLAUDE.md` contains RTK instructions: `cat ~/.claude/CLAUDE.md | head -5`
- Start a new Claude Code session — CLAUDE.md is read at session start

**MemStack DB missing:**
```bash
python ~/tools/memstack/db/memstack-db.py init
```

**Checking all tools are installed:**
```bash
headroom --version   # or: python -m headroom --version
rtk --version
python ~/tools/memstack/db/memstack-db.py init
```
