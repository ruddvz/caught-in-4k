# Agent Playwright Workflow

This workflow file should be followed by agents when working on features or tests.

## 1. Initial Setup Checklist

Before writing any new tests for a session:
- Check if Playwright is properly installed (`npx playwright --version`)
- Ensure the dev server can be started (`npm start` or similar)
- Check where the E2E tests are currently located (usually a `tests-e2e` or similar directory, or within `src`)

## 2. Test Execution Workflow

When investigating or reproducing an issue:
1. Run `npx playwright test` to see the current state
2. If tests fail, run with tracing: `npx playwright test --trace on`
3. If UI debugging is needed, use `--headed`: `npx playwright test --headed`
4. View the report with `npx playwright show-report`

## 3. Leverage "Get Shit Done" (GSD) Skills

When you receive a prompt, seamlessly integrate the GSD tools. If you use the `planner` agent:
1. Ask the `planner` to output steps.
2. If you find a step that maps to a `/gsd-*` command, use the `/gsd-*` tool.
3. Once tests are complete, suggest the next step using the `ask_user` loop in GSD.
4. Execute phases effectively utilizing GSD.

## 4. Multi-Agent Collaboration

Use specialized agents:
- `planner` explicitly when breaking down a new prompt
- `e2e-runner` when working heavily on the test spec files
- `code-reviewer` after any code (including tests) has been modified
- `tdd-guide` to verify testing strategies and coverage

## 5. Artifact Management & Quarantine

- Output screenshots and traces to appropriate test-results folders.
- Clearly note and temporarily quarantine flaky tests in a separate list or `.skip` them with an associative bug link/comment.
