# Workflow 101 — Agent Master Instructions

> **MANDATORY INSTRUCTION:** Every AI agent working in this repository MUST follow this exact to-do list sequentially whenever it receives a new prompt. This guarantees the correct usage of Get Shit Done (GSD), the Everything Claude Code agents, and the Playwright CLI for automated checking.

---

## Phase 0: Context Gathering (Before Anything Else)
- [ ] **Read Project Memory:** Check `/memories/repo/` for any existing notes on architecture, past fixes, or known gotchas. Do not re-learn what has already been recorded.
- [ ] **Read `claude.md`:** Load the project's `claude.md` at the repo root for the tech stack, file organization rules, and available commands.
- [ ] **Scan Project Structure:** Quickly understand what directories and files exist (`src/`, `tests/`, `docs/`, etc.) so you know where things live before planning.
- [ ] **Check Git Status:** Run `git status` and `git log --oneline -5` to understand the current branch, any uncommitted work, and recent history.

---

## Phase 1: Planning and Analysis
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
- [ ] **Code Review:** Hand off the staged diff (`git diff --staged`) to the `code-reviewer` agent (`everything-claude-code/agents/code-reviewer.md`). It must flag at least CRITICAL or HIGH issues.
- [ ] **Security Review:** Hand off the diff to the `security-reviewer` agent (`everything-claude-code/agents/security-reviewer.md`) to ensure no secrets, injection vulnerabilities, or OWASP Top 10 issues are present.
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
