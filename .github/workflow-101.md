# Workflow 101 — Agent Master Instructions

> **MANDATORY INSTRUCTION:** Every AI agent working in this repository MUST follow this exact to-do list sequentially whenever it receives a new prompt. This guarantees the correct usage of Get Shit Done (GSD), the Everything Claude Code agents, and the Playwright CLI for automated checking.

---

## Phase 0: Context Gathering (Before Anything Else)
- [ ] **Read Project Memory:** Check `/memories/repo/` for any existing notes on architecture, past fixes, or known gotchas. Do not re-learn what has already been recorded.
- [ ] **Read `claude.md`:** Load the project's `claude.md` at the repo root for the tech stack, file organization rules, and available commands.
- [ ] **Scan Project Structure:** Quickly understand what directories and files exist (`src/`, `tests/`, `docs/`, etc.) so you know where things live before planning.
- [ ] **Check Git Status:** Run `git status` and `git log --oneline -5` to understand the current branch, any uncommitted work, and recent history.
- [ ] **Read Codemaps:** Read `docs/CODEMAPS/OVERVIEW.md` for the full codebase architecture at a glance, then drill into the relevant module map(s) for the task at hand. This replaces full codebase scanning — only read the source files you actually need to modify.
    - *Available maps:* `OVERVIEW.md`, `app-shell.md`, `common.md`, `components.md`, `routes.md`, `services.md`, `types.md`, `config-and-backend.md`
    - *Target context:* Each map lists files with their purpose, exports, and dependency relationships. Use this to identify exactly which files to read for your task.

---

## Phase 1: Planning and Analysis
- [ ] **Blast-Radius Analysis:** Before planning, consult the relevant codemap(s) in `docs/CODEMAPS/` to identify all callers, dependents, and associated tests of the files you expect to touch. Each codemap lists dependency relationships and import chains. Add all impacted files to your planning scope — never assume a change is isolated. If the blast radius surprises you, flag it to the user before proceeding.
- [ ] **Invoke Planner:** Pass the user's prompt directly to the `planner` agent (located in `everything-claude-code/agents/planner.md`) to deeply analyze the request and break it down into steps.
- [ ] **Consult Architect (if structural):** If the prompt involves new components, route changes, or architectural decisions, invoke the `architect` agent (`everything-claude-code/agents/architect.md`) for a design review before coding.
- [ ] **Initialize GSD:** Use the appropriate get-shit-done command (e.g., `/gsd-plan-phase` or run the workflow from `.github/skills/gsd-*`) to formalize the milestone and tasks.
- [ ] **Create Feature Branch:** For non-trivial changes, create a feature branch (`git checkout -b feat/description`) instead of committing directly to `main`.
- [ ] **Draft the Strategy:** Ask the user for validation of the plan before writing code.

---

## Phase 2: Test-Driven Setup
- [ ] **Consult TDD Guide:** Use the `tdd-guide` agent (`everything-claude-code/agents/tdd-guide.md`) to outline what tests need to be added or modified for this prompt.
- [ ] **Prepare E2E Runner:** If UI interactions are expected, consult the `e2e-runner` agent (`everything-claude-code/agents/e2e-runner.md`) to draft the necessary E2E testing scenarios.
- [ ] **Write Failing Tests First (RED):** Create the test files before writing implementation code. Run tests to confirm they fail as expected.

---

## Phase 3: Execution Using GSD
- [ ] **Execute Phase:** Run the implementation using `/gsd-execute-phase` or `/gsd-do` logic.
- [ ] **Implement Minimum Complete Code:** Keep the changes focused on fulfilling the planned milestone. No over-engineering.
- [ ] **Make Tests Pass (GREEN):** Run the tests written in Phase 2. Iterate until they pass.

---

## Phase 4: Automated Verification via Playwright CLI
- [ ] **Playwright CLI Check:** The agent must autonomously use the Playwright CLI to verify the work.
    - *Run:* `npx playwright test` to verify no existing or new E2E checks are broken.
    - *Run with Tracing (on failure):* `npx playwright test --trace on` to capture deep diagnostics without human intervention.
    - *View Report:* `npx playwright show-report` if failures need visual inspection.
- [ ] **Fix & Iterate:** Resolve any broken tests caught by the Playwright CLI before moving on.
- [ ] **Use Build Error Resolver (if stuck):** If the build or tests fail in a way that is not obvious, invoke the `build-error-resolver` agent (`everything-claude-code/agents/build-error-resolver.md`) to diagnose and fix the issue.

---

## Phase 5: Deep Quality Review
- [ ] **Codemap-Informed Review Scope:** Consult the codemaps in `docs/CODEMAPS/` to identify the complete blast radius of all modified files (callers, dependents, related tests). Hand this expanded file set — not just the raw diff — to both reviewers below. This prevents silently breaking callers that aren't in the diff.
- [ ] **Code Review:** Hand off the staged diff (`git diff --staged`) plus the blast-radius file set to the `code-reviewer` agent (`everything-claude-code/agents/code-reviewer.md`). It must flag at least CRITICAL or HIGH issues.
- [ ] **Security Review:** Hand off the same expanded set to the `security-reviewer` agent (`everything-claude-code/agents/security-reviewer.md`) to ensure no secrets, injection vulnerabilities, or OWASP Top 10 issues are present.
- [ ] **Review Loop-Back:** If the code-reviewer or security-reviewer flags CRITICAL issues, **go back to Phase 3** and fix them. Do NOT proceed to Phase 6 with unresolved critical findings.

> **Tip:** Code review and security review can run in parallel since they are independent.

---

## Phase 6: Documentation & Memory
- [ ] **Update Docs (if needed):** If the change affects UI, APIs, or user-facing behavior, invoke the `doc-updater` agent (`everything-claude-code/agents/doc-updater.md`) to update relevant documentation under `docs/`.
- [ ] **Update Repo Memory:** Record any lessons learned, new patterns, or gotchas in `/memories/repo/` so future sessions don't repeat mistakes.

---

## Phase 7: Wrap-up & Loop
- [ ] **Verify Work:** Run `/gsd-verify-work` or equivalent to ensure the objective is met.
- [ ] **Ask User Loop:** Adhere to the core GSD requirement by explicitly asking the user: **"What's the next step?"** Continue this feedback loop until the user explicitly indicates they are done.

---

## Phase 8: Safe Push to GitHub
> **NEVER push blindly.** This phase is a gatekeeper. Every push must pass through these checks first.

- [ ] **Build Check:** Run `npm run build` and confirm it completes with zero errors (warnings are acceptable).
- [ ] **Lint Check:** Run `npm run lint` and resolve any errors before proceeding.
- [ ] **Unit Tests:** Run `npm test` and confirm all existing tests pass.
- [ ] **Playwright E2E Gate:** Run `npx playwright test` one final time as the last safety net.
    - If ANY test fails, **stop**. Do not push. Fix the failure and re-run from the top of this phase.
    - If tracing is needed: `npx playwright test --trace on` then `npx playwright show-report`.
- [ ] **Diff Review:** Run `git diff --staged` (or `git diff HEAD` if already committed) and do a final visual scan for:
    - Hardcoded secrets or API keys
    - Debug `console.log` statements left behind
    - Unintended file changes
    - Files that should be in `.gitignore`
- [ ] **Commit:** Stage and commit with a conventional commit message (`feat:`, `fix:`, `refactor:`, `docs:`, etc.).
- [ ] **Push:** Only after ALL above checks are green, run `git push`.
- [ ] **Post-Push Verify:** Confirm the push succeeded and the remote is up to date (`git status` should show "Your branch is up to date").
- [ ] **Rollback Plan:** If anything goes wrong after push, note the previous commit hash (from `git log --oneline -2`) so you can `git revert` if needed.

---

## Quick Reference: Available Agents

| Agent | File | When to Use |
|-------|------|-------------|
| `planner` | `everything-claude-code/agents/planner.md` | Breaking down any new prompt |
| `architect` | `everything-claude-code/agents/architect.md` | Structural / design decisions |
| `tdd-guide` | `everything-claude-code/agents/tdd-guide.md` | Writing tests first |
| `e2e-runner` | `everything-claude-code/agents/e2e-runner.md` | Playwright E2E test creation |
| `code-reviewer` | `everything-claude-code/agents/code-reviewer.md` | After writing/modifying code |
| `security-reviewer` | `everything-claude-code/agents/security-reviewer.md` | Before any commit |
| `build-error-resolver` | `everything-claude-code/agents/build-error-resolver.md` | When build/tests fail |
| `doc-updater` | `everything-claude-code/agents/doc-updater.md` | When UI or behavior changes |
| `refactor-cleaner` | `everything-claude-code/agents/refactor-cleaner.md` | Dead code / cleanup tasks |

## Quick Reference: Codemaps

| Map File | Covers | Use When |
|----------|--------|----------|
| `docs/CODEMAPS/OVERVIEW.md` | Full architecture, dependency graph, C4K additions | Start of every session |
| `docs/CODEMAPS/app-shell.md` | `src/App/`, `src/router/` | Routing changes, app shell modifications |
| `docs/CODEMAPS/common.md` | `src/common/` hooks, utils, contexts | Common utility or hook changes |
| `docs/CODEMAPS/components.md` | `src/components/` reusable UI | Component modifications |
| `docs/CODEMAPS/routes.md` | `src/routes/` page-level routes | Route/page changes |
| `docs/CODEMAPS/services.md` | `src/services/` WASM bridge, Shell, Chromecast | Service layer changes |
| `docs/CODEMAPS/types.md` | `src/types/` TypeScript definitions | Type changes |
| `docs/CODEMAPS/config-and-backend.md` | webpack, tsconfig, eslint, api-proxy, CI/CD | Build/config/backend changes |
