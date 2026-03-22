# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Project Overview

**Caught in 4K** is a Gen Z-themed, AI-powered fork of Stremio Web. It streams movies/shows via Stremio add-ons, enriched with AI-generated "Canon Takes" (Gemini-powered commentary).

## Tech Stack

- **Frontend**: React + Webpack (`src/`)
- **Backend proxy**: `api-proxy.js` — reverse-proxies Gemini API calls (keeps API key secret)
- **Claude Code plugin**: `everything-claude-code/` — full agent/skill/hook system
- **Build**: Webpack → `build/`
- **Deploy**: GitHub Pages (`gh-pages` branch)

## File Organization Rules

This project uses **`claude-organize`** via Claude Code hooks. Files you create are automatically sorted.

### ✅ Where to put things
| Type | Goes here |
|------|-----------|
| Test results, QA notes | `docs/testing/` |
| Performance analysis | `docs/analysis/` |
| Architecture notes | `docs/architecture/` |
| Deploy guides, runbooks | `docs/operations/` |
| Debug logs, investigations | `docs/troubleshooting/` |
| Implementation notes | `docs/development/` |
| Plans, roadmaps | `docs/planning/` |
| Validation scripts | `scripts/checks/` |
| Test scripts/runners | `scripts/testing/` |
| Deploy/release scripts | `scripts/deployment/` |
| General utilities | `scripts/utilities/` |
| One-off fix scripts | `scripts/fixes/` |
| Debug utilities | `scripts/debug/` |
| Environment setup scripts | `scripts/setup/` |

### 🚫 Do NOT create files at the project root
Never create test scripts, debug files, or temporary docs in the project root. They will be automatically moved.

### 🔒 Protected files — never move these
```
README.md, LICENSE, LICENSE.md, DESIGN.md, CHANGELOG.md
CODE_OF_CONDUCT.md, CANON_TAKES_SETUP.md, QUICK_START.md
organizing.md, READY_CHECKLIST.md, Dockerfile
package.json, package-lock.json, pnpm-lock.yaml
webpack.config.js, tsconfig.json, eslint.config.mjs
api-proxy.js, api-proxy-template.js
http_server.js, generate-icons.js
setup.bat, setup.sh
.env*, .gitignore, manifest.json
src/*, build/*, assets/*, tests/*
everything-claude-code/*
```

## Commands

```bash
npm run dev           # Start dev server (http://localhost:3000)
npm run build         # Production build → build/
npm test              # Run tests
node api-proxy.js     # Start backend proxy (port 3001)
node http_server.js   # Start simple HTTP server
npm run deploy        # Deploy to GitHub Pages
```

## Architecture

### Frontend (`src/`)
```
src/
├── App/           # Root app component
├── components/    # Reusable UI components (MetaRow, etc.)
├── common/        # Shared utilities
├── router/        # Client-side routing
├── routes/        # Page-level route components
├── services/      # API/data services
└── types/         # TypeScript type definitions
```

### Backend
- `api-proxy.js` — Express server proxying Gemini API (keeps API key secure)
- `api-proxy-template.js` — Template for deploying to Vercel/Netlify

### Claude Code Plugin (`everything-claude-code/`)
Contains agents, skills, commands, hooks, and rules from the everything-claude-code plugin. See `everything-claude-code/CLAUDE.md`.

## Development Notes

- **API key**: Never put `GEMINI_API_KEY` in frontend code — only in `api-proxy.js` server
- **Proxy URL**: Set `REACT_APP_CANON_PROXY_URL` in `.env` to point at your running proxy
- **Translation**: Uses i18n system — wrap strings with `useTranslate()` hook
- **Organization log**: Auto-generated at `docs/organization-log.json` (gitignored)

## Everything Claude Code Integration

The `everything-claude-code/` directory provides:
- **59 commands** (`/tdd`, `/plan`, `/build-fix`, `/code-review`, etc.)
- **28 specialized agents** (planner, code-reviewer, typescript-reviewer, etc.)
- **116 skill directories** (frontend-patterns, deployment-patterns, etc.)
- **Comprehensive hooks** (pre/post tool use, session management, quality gates)

Set `CLAUDE_PLUGIN_ROOT` to the absolute path of `everything-claude-code/` for hooks to work.
