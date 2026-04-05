# C4K Agent Ecosystem — Design Spec
**Date:** 2026-03-27 (v2)
**Status:** Active
**Project:** Caught in 4K (C4K) — Gen Z AI-powered streaming platform

---

## 1. Problem Statement

All work routes through a single Claude session handling frontend, backend, AI features, bug fixes, and docs simultaneously. This is:
- **Slow** — one agent context-switches between unrelated domains
- **Expensive** — large context windows for every task regardless of scope
- **Unguided** — no self-scheduling from existing priority lists
- **Opaque** — no audit trail of what changed and why

---

## 2. Goals

1. **Autonomous dispatch** — Orchestrator self-schedules from `ACTIVE.md` + `EXECUTION-PLAN.md`
2. **Structured handoff protocol** — agents pass contracts, not freeform notes; Guardian can reject
3. **Lean token budget** — RTK on all commands, CODEMAPS instead of full codebase scans, targeted context
4. **Local-first** — all tracking files live in `docs/planning/`. Obsidian sync is optional.
5. **Simple dispatch** — user says "next task" or describes a task. Orchestrator handles everything.

---

## 3. Token Efficiency Stacks

### 3.1 RTK (Rust Token Killer)
Every agent prefixes ALL shell commands with `rtk`. This filters output to essentials only.
- `rtk git status` — compact status (59% savings)
- `rtk npm run build` — errors only (87% savings)
- `rtk npm test` — failures only (90-99% savings)
- `rtk git diff -- <files>` — targeted compact diffs (80% savings)

**Rule:** Even in chained commands: `rtk git add . && rtk git commit -m "msg"`

### 3.2 CODEMAPS (Context Maps)
Located in `docs/CODEMAPS/`. Each map lists files with purpose, exports, and dependency relationships.

**Rule:** Read `OVERVIEW.md` first. Drill into the specific codemap for your task area. Only read source files you will actually modify. Never scan `src/` recursively.

Available maps: `OVERVIEW.md`, `app-shell.md`, `common.md`, `components.md`, `routes.md`, `services.md`, `types.md`, `config-and-backend.md`

### 3.3 Memstack (Claude Memory)
Check `~/.claude/projects/*/memory/` for past decisions, known gotchas, and user preferences.

**Rule:** Before re-learning something, check if it's already in memory. Save new learnings for future sessions.

---

## 4. Architecture

### 4.1 Agent Diagram

```
User Prompt
    │
    ▼
┌─────────────────────────────┐
│       C4K ORCHESTRATOR      │
│                             │
│  reads docs/planning/       │
│    ACTIVE.md                │
│    EXECUTION-PLAN.md        │
│  picks highest-priority     │
│  unblocked task             │
│  dispatches ONE agent       │
│  gates via Guardian         │
│  updates tracking files     │
└──────────┬──────────────────┘
     ┌─────┼──────┐
     ▼     ▼      ▼
┌────────┐ ┌────┐ ┌──────────┐
│STRUCT- │ │SOUL│ │ GUARDIAN  │
│URE     │ │    │ │          │
│        │ │    │ │ Verify   │
│Layout  │ │AI  │ │ Test     │
│CSS     │ │LLM │ │ Security │
│Routes  │ │Prxy│ │ QA       │
│Comps   │ │Voic│ │          │
└────┬───┘ └─┬──┘ └──────────┘
     │       │         ▲
     │  HANDOFF        │ VERDICT
     └────────────────►┘
```

### 4.2 Agent Details

#### C4K Orchestrator (`~/.claude/agents/c4k-orchestrator.md`)
- Entry point — user dispatches this only
- Reads `docs/planning/ACTIVE.md` and `docs/planning/EXECUTION-PLAN.md`
- Selects highest-priority unblocked task
- Dispatches ONE working agent with targeted context
- Forwards HANDOFF to Guardian
- On PASS: updates tracking files
- On FAIL: sends fix instruction back (max 2 retries)

#### Structure Agent (`~/.claude/agents/c4k-structure.md`)
**Owns:** `src/routes/`, `src/components/`, `src/App/`, `src/router/`, `*.less`, `*.css`, `webpack.config.js`, `tsconfig.json`
**Never touches:** `api-proxy.js`, `src/services/BackgroundAgents/`, `src/common/pollinationsApi.js`, `tests/`
**Delegates to:** `typescript-reviewer`, `build-error-resolver`, `refactor-cleaner`, `architect`

#### Soul Agent (`~/.claude/agents/c4k-soul.md`)
**Owns:** `src/common/pollinationsApi.js`, `src/services/BackgroundAgents/`, `src/services/CanonTakesQueue/`, `src/common/useCanonTakes.ts`, `src/common/useSatisfactionMeter.js`, `src/components/CanonTakeBox/`, `api-proxy.js`
**Never touches:** `src/routes/`, `src/components/` (except CanonTakeBox), `tests/`
**Delegates to:** `typescript-reviewer`, `security-reviewer`, `docs-lookup`, `architect`

#### Guardian Agent (`~/.claude/agents/c4k-guardian.md`)
**Owns:** `tests/` directory, `docs/planning/ACTIVE.md` (status updates only)
**Never touches:** any `src/` files — Guardian never writes production code
**Delegates to:** `security-reviewer`, `e2e-runner`, `tdd-guide`, `code-reviewer`

---

## 5. Handoff Protocol

### 5.1 HANDOFF (working agent -> Guardian)

```
HANDOFF {
  from: <Structure|Soul>
  to: Guardian
  task_id: <ID from EXECUTION-PLAN.md, e.g. S1.1a>
  task_description: <one line>
  files_changed: [<file paths>]
  what_was_done: <2-3 sentences>
  bugs_addressed: [<bug IDs from ACTIVE.md>]
  known_risks: <edge cases to check>
  check_specifically: <what Guardian should focus on>
}
```

### 5.2 VERDICT (Guardian -> Orchestrator)

```
VERDICT {
  task_id: <same ID>
  pass: <true|false>
  checks_performed: [<list of specific checks>]
  findings: <detailed findings with file:line references>
  result: <"PASS: fix is correct and safe" | "FAIL: [specific issue]">
  send_back_to: <Structure|Soul>      # only if pass: false
  specific_fix: <exact instruction>    # only if pass: false
  bugs_resolved: [<bug IDs>]           # only if pass: true
}
```

### 5.3 Rejection Loop

If VERDICT `pass: false`:
1. Orchestrator sends `specific_fix` back to working agent
2. Working agent fixes and re-issues HANDOFF (max 2 retries)
3. If 3rd attempt still fails: Orchestrator notifies user with full context
4. User decides next step

---

## 6. Self-Scheduling Logic

Orchestrator priority order:
1. **User's explicit request** — always highest priority
2. `ACTIVE.md` — `Status: Open`, severity `Critical`
3. `ACTIVE.md` — `Status: Open`, severity `Major`
4. `EXECUTION-PLAN.md` — CRITICAL section, unchecked `[ ]` items
5. `EXECUTION-PLAN.md` — MAJOR section, unchecked items
6. `EXECUTION-PLAN.md` — MEDIUM section, unchecked items
7. ROADMAP items

**Blocked:** item's `Depends on:` references an uncompleted item. Skip it.
**Parallel:** items marked `PARALLEL` can be picked freely.

---

## 7. File Locations

### Agent Files
```
~/.claude/agents/
  c4k-orchestrator.md
  c4k-structure.md
  c4k-soul.md
  c4k-guardian.md
```

### Tracking Files (Local — Source of Truth)
```
docs/planning/ACTIVE.md          # Bug queue
docs/planning/EXECUTION-PLAN.md  # Roadmap with status
```

### Reference Files
```
docs/CODEMAPS/OVERVIEW.md        # Architecture at a glance
.github/workflow-101.md          # Agent operating protocol
CLAUDE.md                        # Project instructions
```

### Obsidian (Optional Sync)
```
C4K-Brain/ACTIVE.md              # Mirror of local
C4K-Brain/EXECUTION-PLAN.md      # Mirror of local
C4K-Brain/sessions/              # Session notes (written on demand)
C4K-Brain/agent-graph.md         # Wikilink graph (written on demand)
```

---

## 8. Dispatch Flow (Step by Step)

```
1. User: "next task" or "fix the settings scroll"
2. Orchestrator reads docs/planning/ACTIVE.md + EXECUTION-PLAN.md
3. Orchestrator selects task (or uses user's specified task)
4. Orchestrator dispatches working agent with:
   - Task ID, description, root cause
   - Specific file paths to modify
   - Relevant specialist agents to use
   - RTK/CODEMAPS instructions
5. Working agent:
   a. Reads relevant CODEMAP
   b. Reads only files it will modify
   c. Makes minimal change
   d. Runs `rtk npm run build`
   e. Spawns specialist agents
   f. Emits HANDOFF contract
6. Orchestrator forwards HANDOFF to Guardian
7. Guardian:
   a. Reads files_changed
   b. Runs `rtk npm run build` + `rtk npm test`
   c. Spawns specialist agents (parallel where possible)
   d. Checks CSS/layout or AI/backend specifics
   e. Emits VERDICT
8. Orchestrator:
   - PASS: Updates EXECUTION-PLAN.md + ACTIVE.md, reports done
   - FAIL: Sends specific_fix back to working agent (retry loop)
```

---

## 9. Token Budget

| Scenario | Agents | Token Strategy |
|----------|--------|---------------|
| Single bug fix | Orchestrator + Structure + Guardian | RTK saves 60-90% on commands. CODEMAPS eliminates full codebase reads. ~3x agent cost, but 50-70% less per agent. |
| AI feature | Orchestrator + Soul + Guardian | Same savings. Soul reads only its owned files. |
| Complex feature | Orchestrator + Planner + Working + Guardian | Planner runs first with targeted context, feeds plan to working agent. |

**Net effect:** 3x agent overhead, but each agent uses 50-70% fewer tokens than the old single-session approach thanks to RTK + CODEMAPS + Memstack.

---

## 10. Out of Scope

- No agent writes to `tests/` except Guardian
- No agent modifies `package.json` dependencies without Orchestrator approval
- No agent pushes to git — always user-confirmed
- No agent reads another agent's context — communication is via HANDOFF/VERDICT only
- Obsidian sync is user-triggered, not automatic
