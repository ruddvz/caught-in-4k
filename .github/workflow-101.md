# Workflow 101 — C4K Agent Operating Protocol

> Every agent in this repo follows this workflow. The C4K Orchestrator enforces it.
> Phases are sequential. Skip a phase only if it genuinely doesn't apply — say so explicitly.

---

## Token Efficiency Rules (Apply Everywhere)

All agents MUST minimize token usage:

1. **RTK prefix** — Every shell command uses `rtk` (e.g., `rtk git status`, `rtk npm run build`). RTK filters output to essentials only. Even chained commands: `rtk git add . && rtk git commit -m "msg"`.
2. **CODEMAPS first** — Never scan the full codebase. Read `docs/CODEMAPS/OVERVIEW.md` first, then drill into the specific codemap for your task. Only read source files you will actually modify.
3. **Memstack** — Check Claude memory (`~/.claude/projects/*/memory/`) for past decisions, known gotchas, and user preferences before re-learning them.
4. **No redundant reads** — If the Orchestrator already provided file contents or context in your task prompt, don't re-read those files.
5. **Targeted git** — Use `rtk git diff -- <specific-files>` not `rtk git diff` (entire repo). Use `rtk git log --oneline -5` not full log.

---

## Phase 0: Context Gathering

- [ ] Read `docs/CODEMAPS/OVERVIEW.md` — architecture at a glance
- [ ] Drill into the relevant codemap(s) for your task area
- [ ] `rtk git status` + `rtk git log --oneline -5` — current branch and recent history
- [ ] Read ONLY the source files you will modify (identified via codemaps)

> **Do NOT** scan `src/` recursively, read every file, or explore broadly. Codemaps exist to prevent this.

---

## Phase 1: Planning

- [ ] **Blast-radius analysis** — Use the relevant codemap to find all callers, dependents, and tests of files you'll touch. If blast radius is larger than expected, flag to user.
- [ ] **Plan the change** — For non-trivial tasks (3+ files, new feature, architectural change), create a brief plan before coding. For single-file bug fixes, skip this.
- [ ] **Create feature branch** — `rtk git checkout -b feat/<description>` for non-trivial changes.

> Complex features: use the `planner` agent. Architectural changes: use the `architect` agent. Simple bug fixes: just plan in your head and go.

---

## Phase 2: Test-Driven Setup (if applicable)

- [ ] Identify what tests need to change (check codemap test references)
- [ ] Write failing tests first (RED) if the task is a bug fix or new feature
- [ ] Skip this phase for CSS-only fixes, doc updates, or config changes

---

## Phase 3: Implementation

- [ ] Make the minimal change that solves the problem
- [ ] Do NOT refactor surrounding code, add features, or "improve" things not in scope
- [ ] Make tests pass (GREEN)
- [ ] Run `rtk npm run build` — fix any build errors before proceeding

---

## Phase 4: Verification

- [ ] `rtk npm run build` — zero errors
- [ ] `rtk npm test` — all tests pass
- [ ] If UI change: reason about behavior at 375px, 768px, and 1280px+ viewports
- [ ] If `api-proxy.js` changed: verify no hardcoded secrets, proper error handling

> Build or test failures: use `build-error-resolver` agent. Don't loop manually.

---

## Phase 5: Quality Review

- [ ] Spawn `code-reviewer` agent on changed files
- [ ] Spawn `security-reviewer` agent if touching `api-proxy.js`, auth, or user input
- [ ] Both can run **in parallel** (independent)
- [ ] If CRITICAL issues found: go back to Phase 3, fix, re-verify
- [ ] If only LOW/MEDIUM issues: note in HANDOFF, proceed

---

## Phase 6: Handoff

- [ ] Emit HANDOFF contract (working agents) or VERDICT contract (Guardian)
- [ ] Include all files changed, what was done, known risks, and what to verify
- [ ] Do NOT push to git — always leave that to the user

---

## Phase 7: Documentation (if applicable)

- [ ] Update `docs/CODEMAPS/` if you added new files or changed exports/dependencies
- [ ] Update other docs only if the change affects user-facing behavior or setup steps
- [ ] Skip for pure bug fixes that don't change architecture

---

## Quick Reference: Agent Routing

| Task Type | Agent |
|-----------|-------|
| Layout, CSS/LESS, components, routes | `c4k-structure` |
| Canon Takes, AI features, proxy, LLM APIs | `c4k-soul` |
| QA verification, tests, security audit | `c4k-guardian` |
| Complex new feature planning | `planner` then working agent |
| Architecture decisions | `architect` |
| Build failures | `build-error-resolver` |
| TypeScript review | `typescript-reviewer` |
| Security review | `security-reviewer` |
| Code quality review | `code-reviewer` |
| Documentation updates | `doc-updater` |

## Quick Reference: Codemaps

| Map | Covers | Read When |
|-----|--------|-----------|
| `OVERVIEW.md` | Full architecture, C4K additions | Every session start |
| `app-shell.md` | `src/App/`, `src/router/` | Routing, app shell |
| `common.md` | `src/common/` hooks, utils | Hook/utility changes |
| `components.md` | `src/components/` UI | Component work |
| `routes.md` | `src/routes/` pages | Route/page changes |
| `services.md` | `src/services/` WASM, Shell | Service layer |
| `types.md` | `src/types/` definitions | Type changes |
| `config-and-backend.md` | webpack, api-proxy, CI | Build/config/backend |
