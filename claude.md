# CLAUDE.md

## Project Overview

**Caught in 4K (C4K)** — Gen Z-themed, AI-powered Stremio Web fork. Streams movies/shows via Stremio add-ons, enriched with AI-generated "Canon Takes" (Gemini-powered commentary).

## Token Efficiency — MANDATORY

This project uses three token-saving stacks. All agents MUST use them:

1. **RTK** — Prefix ALL shell commands with `rtk`. Saves 60-90% tokens on command output.
   ```bash
   rtk git status          # not: git status
   rtk npm run build       # not: npm run build
   rtk npm test            # not: npm test
   rtk git diff -- file.js # not: git diff (entire repo)
   ```

2. **CODEMAPS** — Never scan the full codebase. Read `docs/CODEMAPS/OVERVIEW.md` first, drill into the specific codemap, then read only the files you'll modify.

3. **Memstack** — Check Claude memory for past decisions before re-learning. Don't repeat what's already known.

## Agent Ecosystem

This project uses the **C4K Agent Ecosystem** — 4 specialized agents that communicate via structured contracts. See `docs/superpowers/specs/c4k-agent-ecosystem.md` for the full spec.

| Agent | Role | Files |
|-------|------|-------|
| **C4K Orchestrator** | Dispatch, coordination, completion tracking | `~/.claude/agents/c4k-orchestrator.md` |
| **Structure** | Layout, CSS, components, routes | `~/.claude/agents/c4k-structure.md` |
| **Soul** | Canon Takes, AI, LLM APIs, proxy | `~/.claude/agents/c4k-soul.md` |
| **Guardian** | QA, tests, security, verification | `~/.claude/agents/c4k-guardian.md` |

**Workflow:** User prompt → Orchestrator reads PLAN.md → dispatches agent → agent works → HANDOFF to Guardian → VERDICT back → Orchestrator updates tracking.

## Priority Files (Local)

| File | Purpose |
|------|---------|
| `docs/planning/PLAN.md` | Bug queue + roadmap — single source of truth |
| `.github/workflow-101.md` | Agent operating protocol — all agents follow this |
| `docs/CODEMAPS/OVERVIEW.md` | Architecture map — read this, not the full codebase |

## Tech Stack

- **Frontend**: React 18 + Webpack 5 (`src/`)
- **Styling**: LESS modules (scoped per component)
- **Backend proxy**: `api-proxy.js` — Express, proxies Gemini API
- **Build**: Webpack → `build/`
- **Deploy**: GitHub Pages (`gh-pages` branch)
- **WASM core**: Stremio core via `useModelState` + `withCoreSuspender`

## Commands (always use RTK prefix)

```bash
rtk npm run dev           # Dev server (http://localhost:3000)
rtk npm run build         # Production build → build/
rtk npm test              # Run tests
rtk node api-proxy.js     # Backend proxy (port 3001)
rtk npm run deploy        # Deploy to GitHub Pages
```

## Architecture

```
src/
├── App/           # Root app, shell
├── components/    # Reusable UI (MetaRow, MetaPreview, CanonTakeBox, etc.)
├── common/        # Shared hooks, utils, contexts
├── router/        # Client-side routing
├── routes/        # Page components (Board, Discover, MetaDetails, Settings, etc.)
├── services/      # WASM bridge, BackgroundAgents, CanonTakesQueue
└── types/         # TypeScript definitions
```

## Key Rules

- **API keys**: Never in frontend code — only in `api-proxy.js` via `process.env`
- **Proxy URL**: `REACT_APP_CANON_PROXY_URL` in `.env`
- **i18n**: Wrap user-facing strings with `useTranslate()` hook
- **Immutability**: Create new objects, never mutate
- **No inline styles**: Always use LESS modules
- **Safe areas**: Use `env(safe-area-inset-*)` for mobile padding

## File Organization

| Type | Location |
|------|----------|
| Plans, roadmaps, PLAN.md | `docs/planning/` |
| Architecture notes | `docs/architecture/` |
| Test results | `docs/testing/` |
| Debug investigations | `docs/troubleshooting/` |
| Validation scripts | `scripts/checks/` |

Do NOT create files at the project root. They will be auto-moved by hooks.
