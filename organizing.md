# 🗂️ Organizing Plan: Integrating claude-organizer into Caught in 4K

> **Source repo**: [ramakay/claude-organizer](https://github.com/ramakay/claude-organizer)
> **Target project**: `caught-in-4k` (C4K platform)
> **Created**: 2026-03-22

---

## 📋 Table of Contents

1. [Overview — What We're Doing](#1-overview)
2. [Current State Audit](#2-current-state-audit)
3. [What claude-organizer Provides](#3-what-claude-organizer-provides)
4. [Step-by-Step Integration Plan](#4-step-by-step-integration-plan)
5. [File Organization Categories](#5-file-organization-categories)
6. [Directory Structure (Target)](#6-directory-structure-target)
7. [Configuration & Environment](#7-configuration--environment)
8. [Hook Wiring](#8-hook-wiring)
9. [Slash Commands](#9-slash-commands)
10. [Safety & Rollback](#10-safety--rollback)
11. [Verification Checklist](#11-verification-checklist)

---

## 1. Overview

The **claude-organizer** (npm: `claude-organize`) is an AI-powered file organization tool that:

- Automatically categorizes files created during Claude Code sessions
- Moves test scripts, debug files, docs, and temp files to the proper subdirectories
- Hooks into Claude Code via `PostToolUse` hooks (triggers after Write/Edit/MultiEdit)
- Protects critical files (README, LICENSE, configs, `src/`) from being moved

We already have an `everything-claude-code/` folder with a full plugin system (agents, skills, commands, hooks, rules, scripts). The goal here is to **layer claude-organizer on top** so files stay organized during development.

---

## 2. Current State Audit

### Project Root (files that can accumulate clutter)
```
caught-in-4k/
├── .env, .env.example, .env.local          # Config — PROTECTED
├── CANON_TAKES_SETUP.md                     # Custom doc
├── CHANGELOG.md, CODE_OF_CONDUCT.md         # Standard docs — PROTECTED
├── DESIGN.md                                # Project design — PROTECTED
├── Dockerfile                               # Deploy — PROTECTED
├── LICENSE, LICENSE.md                       # License — PROTECTED
├── QUICK_START.md, README.md                # Docs — PROTECTED
├── READY_CHECKLIST.md                       # Checklist doc
├── api-proxy-template.js, api-proxy.js      # Backend proxies
├── generate-icons.js, http_server.js        # Build/server utilities
├── eslint.config.mjs, webpack.config.js     # Config — PROTECTED
├── setup.bat, setup.sh                      # Setup scripts — PROTECTED
├── package.json, tsconfig.json              # Config — PROTECTED
├── everything-claude-code/                  # Claude Code plugin (full system)
├── src/                                     # App source — PROTECTED
├── build/                                   # Build output — PROTECTED
├── assets/                                  # Static assets — PROTECTED
└── tests/                                   # Test suite — PROTECTED
```

### Existing `everything-claude-code/` Plugin
```
everything-claude-code/
├── .claude/           # Claude settings (identity, rules, etc.)
├── agents/            # 28 specialized subagents
├── commands/          # 59 slash commands
├── hooks/hooks.json   # Hook config (PreToolUse, PostToolUse, Stop, etc.)
├── rules/             # Coding rules by language
├── scripts/           # Utility scripts + hook scripts
├── skills/            # 116 skill directories
├── docs/              # Documentation
├── CLAUDE.md          # Plugin CLAUDE.md
└── README.md          # Plugin README
```

---

## 3. What claude-organizer Provides

### Core Capability
An npm CLI tool (`claude-organize`) that reads file metadata from Claude Code hook input and automatically categorizes + moves files to organized directories.

### Key Features
| Feature | Description |
|---------|-------------|
| **AI categorization** | Analyzes file content to determine category |
| **Pattern matching** | Fast path for common naming patterns |
| **10 script subcategories** | Granular organization for scripts |
| **9 doc subcategories** | Granular organization for docs |
| **Safe defaults** | Never moves protected files |
| **Organization log** | JSON log at `docs/organization-log.json` |
| **Bypass toggle** | `/claude-organize-bypass` slash command |
| **Debug mode** | `CLAUDE_ORGANIZE_DEBUG=true` for visibility |

---

## 4. Step-by-Step Integration Plan

### Phase 1: Install claude-organize

```bash
# Step 1.1 — Install globally
npm install -g claude-organize

# Step 1.2 — Verify installation
claude-organize --help
```

### Phase 2: Create the directory structure

Create the organized directories that claude-organizer expects:

```bash
# Step 2.1 — Documentation directories
mkdir -p docs/testing
mkdir -p docs/analysis
mkdir -p docs/architecture
mkdir -p docs/operations
mkdir -p docs/troubleshooting
mkdir -p docs/development
mkdir -p docs/planning
mkdir -p docs/cleanup
mkdir -p docs/general

# Step 2.2 — Script directories
mkdir -p scripts/checks
mkdir -p scripts/testing
mkdir -p scripts/deployment
mkdir -p scripts/utilities
mkdir -p scripts/fixes
mkdir -p scripts/database
mkdir -p scripts/debug
mkdir -p scripts/setup
mkdir -p scripts/workflows
mkdir -p scripts/activation
```

### Phase 3: Configure the PostToolUse hook

Add the `claude-organize` command to the existing hooks system.

#### Option A — Add to `everything-claude-code/hooks/hooks.json`

Add a new entry to the `PostToolUse` array:

```json
{
  "matcher": "Write|Edit|MultiEdit",
  "hooks": [
    {
      "type": "command",
      "command": "claude-organize"
    }
  ],
  "description": "Auto-organize files created by Claude into proper directories"
}
```

#### Option B — Add to project-level `.claude/settings.json`

If you prefer project-scoped hooks (separate from the everything-claude-code plugin):

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "claude-organize"
          }
        ]
      }
    ]
  }
}
```

> [!IMPORTANT]
> **Choose Option A if** you want it integrated into the existing plugin system.
> **Choose Option B if** you want it as a standalone project-level config.

### Phase 4: Set up environment variables

Create or update the project `.env` file with claude-organize settings:

```bash
# ── Claude Organize Config ──────────────────────────
CLAUDE_ORGANIZE_BYPASS=false
CLAUDE_ORGANIZE_DEBUG=false

# Files/patterns to NEVER move (add project-specific ones)
CLAUDE_ORGANIZE_SKIP_PATTERNS=*.config.js,*.config.mjs,webpack.config.js,api-proxy.js,api-proxy-template.js,http_server.js,generate-icons.js,setup.bat,setup.sh,DESIGN.md,CANON_TAKES_SETUP.md,QUICK_START.md,READY_CHECKLIST.md,organizing.md

# JavaScript organization (EXPERIMENTAL — off by default)
CLAUDE_ORGANIZE_JS=false
CLAUDE_ORGANIZE_JS_MODE=safe
```

### Phase 5: Organize existing loose files

Review and manually move any existing loose files that should be organized:

| File | Move To | Reason |
|------|---------|--------|
| `CANON_TAKES_SETUP.md` | `docs/operations/` | Deployment/setup doc |
| `QUICK_START.md` | `docs/general/` or keep at root | User-facing doc |
| `READY_CHECKLIST.md` | `docs/operations/` | Pre-deploy checklist |
| `api-proxy-template.js` | `scripts/deployment/` | Deployment utility template |
| `generate-icons.js` | `scripts/utilities/` | Build utility |
| `http_server.js` | `scripts/utilities/` | Dev server utility |
| `setup.bat` / `setup.sh` | `scripts/setup/` | Setup scripts |

> [!WARNING]
> **Do NOT move these without checking if anything imports/references them** (webpack config, package.json scripts, GitHub Actions, etc.). If they are referenced by path, you must update those references too.

### Phase 6: Create a CLAUDE.md at project root

The project currently has no root-level `CLAUDE.md`. Creating one will help Claude Code understand the project structure and organization rules:

```markdown
# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

This is **Caught in 4K**, a Gen Z-themed streaming platform with AI-powered features.

## File Organization

This project uses `claude-organize` for automatic file organization.

### Rules
- **NEVER** create test scripts, debug files, or temporary docs in the project root
- Documentation files → `docs/<subcategory>/`
- Script files → `scripts/<subcategory>/`
- Source code → `src/` (existing structure)
- Test files → `tests/`

### Protected Files (never move these)
README.md, LICENSE, LICENSE.md, DESIGN.md, CHANGELOG.md,
CODE_OF_CONDUCT.md, package.json, webpack.config.js,
tsconfig.json, eslint.config.mjs, Dockerfile, .env*

## Architecture
- **Frontend**: React + Webpack (src/)
- **Backend proxy**: api-proxy.js
- **Claude Code plugin**: everything-claude-code/
- **Build**: `npm run build` → build/
- **Dev server**: `npm run dev` or `node http_server.js`

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm test` — Run tests
```

### Phase 7: Add slash command workflows

Create workflow files so you can control the organizer:

#### `everything-claude-code/commands/organize-bypass.md` (or as a workflow)

```markdown
---
description: Toggle claude-organize file organization on/off
---

Toggle the CLAUDE_ORGANIZE_BYPASS environment variable:
- If currently `false`, set to `true` (disable organization)
- If currently `true`, set to `false` (enable organization)
```

### Phase 8: Update .gitignore

Add the organization log to `.gitignore` since it's ephemeral:

```
# Claude Organize
docs/organization-log.json
```

---

## 5. File Organization Categories

### Documentation Categories

| Directory | What Goes Here |
|-----------|---------------|
| `docs/testing/` | Test results, QA reports, validation outputs |
| `docs/analysis/` | Performance reports, data analysis |
| `docs/architecture/` | System design, technical architecture docs |
| `docs/operations/` | Deployment guides, runbooks, checklists |
| `docs/development/` | Implementation details, code documentation |
| `docs/planning/` | Project plans, roadmaps, specifications |
| `docs/troubleshooting/` | Debug logs, issue investigations, fix notes |
| `docs/cleanup/` | Temporary files marked for deletion |
| `docs/general/` | Miscellaneous documentation |

### Script Categories

| Directory | What Goes Here |
|-----------|---------------|
| `scripts/checks/` | Verification and validation scripts |
| `scripts/testing/` | Test runners, test scripts |
| `scripts/deployment/` | Deploy & release scripts |
| `scripts/utilities/` | General utility scripts |
| `scripts/fixes/` | One-off fix scripts |
| `scripts/database/` | DB migration & query scripts |
| `scripts/debug/` | Debug utilities |
| `scripts/setup/` | Environment setup scripts |
| `scripts/workflows/` | Multi-step workflow scripts |
| `scripts/activation/` | Feature activation scripts |

---

## 6. Directory Structure (Target)

After integration, the project should look like this:

```
caught-in-4k/
├── .claude/                         # Project-level Claude settings (if Option B)
│   └── settings.json
├── .env                             # Includes CLAUDE_ORGANIZE_* vars
├── .gitignore                       # Updated with org-log exclusion
├── CLAUDE.md                        # NEW — Root project guidance file
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── DESIGN.md
├── Dockerfile
├── LICENSE / LICENSE.md
├── README.md
├── api-proxy.js
├── package.json
├── webpack.config.js
├── tsconfig.json
├── eslint.config.mjs
│
├── docs/                            # NEW — Organized documentation
│   ├── testing/
│   ├── analysis/
│   ├── architecture/
│   ├── operations/
│   ├── troubleshooting/
│   ├── development/
│   ├── planning/
│   ├── cleanup/
│   ├── general/
│   └── organization-log.json        # Auto-generated log
│
├── scripts/                         # NEW — Organized scripts
│   ├── checks/
│   ├── testing/
│   ├── deployment/
│   ├── utilities/
│   ├── fixes/
│   ├── database/
│   ├── debug/
│   ├── setup/
│   ├── workflows/
│   └── activation/
│
├── src/                             # Untouched app source
├── build/                           # Untouched build output
├── assets/                          # Untouched static assets
├── tests/                           # Untouched test suite
├── node_modules/                    # Untouched
└── everything-claude-code/          # Existing plugin (hooks updated)
```

---

## 7. Configuration & Environment

### Required `.env` additions

```env
# Claude Organize
CLAUDE_ORGANIZE_BYPASS=false
CLAUDE_ORGANIZE_DEBUG=false
CLAUDE_ORGANIZE_SKIP_PATTERNS=*.config.js,*.config.mjs,webpack.config.js,api-proxy.js,api-proxy-template.js,http_server.js,generate-icons.js,setup.bat,setup.sh,DESIGN.md,CANON_TAKES_SETUP.md,QUICK_START.md,READY_CHECKLIST.md,organizing.md
CLAUDE_ORGANIZE_JS=false
CLAUDE_ORGANIZE_JS_MODE=safe
```

### `.env.example` update

Add the same block (with comments explaining each variable) to `.env.example` so other devs know about it.

---

## 8. Hook Wiring

### How it flows

```
User prompts Claude Code
  → Claude creates/edits a file
    → PostToolUse hook fires (matcher: Write|Edit|MultiEdit)
      → claude-organize CLI runs
        → Reads file metadata from stdin
        → Checks skip patterns → If match, skip
        → Pattern-matches filename → If recognized, move
        → Falls back to AI content analysis → Categorize & move
        → Logs action to docs/organization-log.json
```

### Integration with existing hooks

The `everything-claude-code/hooks/hooks.json` already has these PostToolUse hooks:

1. `post:bash:pr-created` — Logs PR URLs
2. `post:bash:build-complete` — Build analysis (async)
3. `post:quality-gate` — Quality gate checks (async)
4. `post:edit:format` — Auto-format JS/TS
5. `post:edit:typecheck` — TypeScript checks
6. `post:edit:console-warn` — Console.log warnings
7. `post:governance-capture` — Governance events
8. `post:observe` — Continuous learning

**The `claude-organize` hook should be added at the END of the PostToolUse array** so it runs after all other checks complete.

---

## 9. Slash Commands

These slash commands come with claude-organize:

| Command | Effect |
|---------|--------|
| `/claude-organize-bypass` | Toggle file organization on/off |
| `/claude-organize-add <pattern>` | Add patterns to be organized |
| `/claude-organize-js` | Enable JavaScript organization (experimental) |

---

## 10. Safety & Rollback

> [!CAUTION]
> claude-organize **MOVES files**. Always use Git to track changes so you can revert.

### Before enabling
- [ ] Commit all current changes to git
- [ ] Make sure no files are in an uncommitted state
- [ ] Test in a feature branch first

### Protected files (never moved)
```
README.md, LICENSE, CONTRIBUTING.md
package.json, package-lock.json, yarn.lock
.git/*, .gitignore, .gitmodules
dist/*, build/*, node_modules/*, src/*
*.config.js, *.config.ts, *.config.json
*.exe, *.dll, *.zip, *.tar.gz
```

### If something goes wrong
```bash
# Check what was moved
cat docs/organization-log.json

# Undo with git
git checkout -- .
git clean -fd

# Or disable the hook
set CLAUDE_ORGANIZE_BYPASS=true
```

---

## 11. Verification Checklist

After integration, verify everything works:

- [ ] `claude-organize` CLI is installed and accessible (`claude-organize --help`)
- [ ] `docs/` subdirectories exist
- [ ] `scripts/` subdirectories exist
- [ ] Hook is wired in hooks.json OR `.claude/settings.json`
- [ ] `.env` contains the `CLAUDE_ORGANIZE_*` variables
- [ ] `.gitignore` excludes `docs/organization-log.json`
- [ ] Root `CLAUDE.md` exists with organization rules
- [ ] Protected files were NOT moved (README, LICENSE, package.json, src/*, etc.)
- [ ] Creating a test file at root triggers auto-organization
- [ ] `docs/organization-log.json` logs the action
- [ ] `/claude-organize-bypass` toggle works
- [ ] The app still builds (`npm run build`)
- [ ] Dev server still works (`npm run dev`)

---

## Summary of Changes Needed

| # | Step | Type | Files Affected |
|---|------|------|---------------|
| 1 | Install `claude-organize` globally | Terminal | — |
| 2 | Create `docs/` subdirectories (9 folders) | Filesystem | `docs/*/` |
| 3 | Create `scripts/` subdirectories (10 folders) | Filesystem | `scripts/*/` |
| 4 | Add PostToolUse hook | Edit | `hooks.json` OR `.claude/settings.json` |
| 5 | Add env vars | Edit | `.env`, `.env.example` |
| 6 | Create root `CLAUDE.md` | New file | `CLAUDE.md` |
| 7 | Update `.gitignore` | Edit | `.gitignore` |
| 8 | (Optional) Move existing loose files | Move | Various |
| 9 | Test the full flow | Terminal | — |

---

> **Next step**: Review this plan, then tell me to start executing it step by step! 🚀
