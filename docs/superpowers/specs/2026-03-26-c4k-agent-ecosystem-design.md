# C4K Agent Ecosystem — Design Spec
**Date:** 2026-03-26
**Status:** Approved
**Project:** Caught in 4K (C4K) — Gen Z AI-powered Stremio Web fork

---

## 1. Problem Statement

All work currently routes through a single Claude session that handles frontend, backend, AI features, bug fixes, and docs simultaneously. This is:
- Slow — one agent context-switches between unrelated domains
- Expensive — large context windows for every task regardless of scope
- Unguided — no self-scheduling from existing priority lists
- Opaque — no audit trail of what changed, why, and who approved it

---

## 2. Goals

1. **Autonomous dispatch** — Orchestrator self-schedules from `ACTIVE.md` + `EXECUTION-PLAN.md` with no manual task assignment
2. **Rich handoff protocol** — agents pass structured contracts, not freeform notes; Guardian can reject and send work back
3. **Lean token budget** — 3 working agents max, non-overlapping file ownership, no agent touches another's domain
4. **iPhone-controllable** — user updates two Obsidian files to steer all work; dispatches via Claude app
5. **Obsidian graph output** — every task cycle writes a session note and updates a link graph in the vault
6. **Notify only on Guardian rejection** — silent on success, loud on failure

---

## 3. Architecture

### 3.1 Agents

```
           ┌─────────────────────────┐
           │     C4K ORCHESTRATOR    │
           │                         │
           │  • reads ACTIVE.md      │
           │  • reads EXECUTION-PLAN │
           │  • assigns tasks        │
           │  • gates completion     │
           │  • writes Obsidian      │
           │  • notifies on reject   │
           └────────────┬────────────┘
          ┌─────────────┼──────────────┐
          ▼             ▼              ▼
   ┌────────────┐ ┌──────────┐ ┌───────────────┐
   │ STRUCTURE  │ │   SOUL   │ │   GUARDIAN    │
   │            │ │          │ │               │
   │ Layout     │ │ Canon    │ │ Bug verif.    │
   │ Components │ │ Takes    │ │ Tests         │
   │ Routes     │ │ Pollina- │ │ Security      │
   │ LESS/CSS   │ │ tions    │ │ Perf audit    │
   │ WASM bridge│ │ AI voice │ │ Obsidian sync │
   └────────────┘ └──────────┘ └───────────────┘
```

### 3.2 Agent Responsibilities

#### C4K Orchestrator
- Entry point for all work — user dispatches this agent only
- Reads `C4K-Brain/ACTIVE.md` (emergency queue) then `C4K-Brain/EXECUTION-PLAN.md` (roadmap)
- Selects the single highest-priority unblocked task
- Dispatches exactly one working agent per task
- Waits for HANDOFF from working agent → forwards to Guardian
- Waits for VERDICT from Guardian → either closes task or sends back to working agent
- On close: updates EXECUTION-PLAN.md, writes Obsidian session note
- On reject: notifies user with Guardian's specific failure reason

#### Structure Agent
**Owns exclusively:**
- `src/routes/` — all page-level route components
- `src/components/` — all reusable UI components
- `src/App/` — root app, router
- `*.less` / `*.css` files anywhere in `src/`
- `webpack.config.js`, `tsconfig.json`

**Does not touch:** `api-proxy.js`, `src/services/BackgroundAgents/`, `src/common/pollinationsApi.js`, `tests/`

**Specialization context loaded at spawn:**
- DESIGN.md design tokens and component specs
- CODEMAPS/components.md + routes.md
- Active layout/mobile bugs from ACTIVE.md

#### Soul Agent
**Owns exclusively:**
- `src/common/pollinationsApi.js`
- `src/services/BackgroundAgents/`
- `src/services/CanonTakesQueue/`
- `src/common/useCanonTakes.ts`
- `src/common/useSatisfactionMeter.js`
- `src/components/CanonTakeBox/`
- `api-proxy.js`
- `src/common/pollinationsApi.js`

**Does not touch:** route-level layout, LESS files outside CanonTakeBox, tests/

**Specialization context loaded at spawn:**
- The Canon Takes system prompt (tone, voice rules)
- Current Pollinations + Gemini proxy integration
- EXECUTION-PLAN.md AI feature items

#### Guardian Agent
**Owns exclusively:**
- `tests/` directory
- Read-only verification of any changed files
- `C4K-Brain/ACTIVE.md` updates (marks bugs resolved)
- Writing Obsidian session notes

**Does not touch:** any `src/` files — Guardian never writes production code

**Specialization context loaded at spawn:**
- Full ACTIVE.md bug list
- The HANDOFF contract from the working agent
- Files changed in the task

---

## 4. Handoff Protocol

### 4.1 HANDOFF Contract (working agent → Guardian)

```
HANDOFF {
  from: <Structure|Soul>
  to: Guardian
  task_id: <id from EXECUTION-PLAN.md>
  task_description: <one line>
  files_changed: [<list of file paths>]
  what_was_done: <2-3 sentences>
  bugs_addressed: [<bug IDs from ACTIVE.md if any>]
  known_risks: <any edge cases or things to double-check>
  check_specifically: <what Guardian should focus on>
}
```

### 4.2 VERDICT Contract (Guardian → Orchestrator)

```
VERDICT {
  task_id: <same id>
  pass: <true|false>
  tested_on: [desktop, mobile-375px, tablet-768px]
  findings: <what was checked>
  result: <PASS: task complete | FAIL: specific issue found>
  send_back_to: <Structure|Soul>  # only if pass: false
  specific_fix: <exact instruction>  # only if pass: false
  obsidian_note: <path written>
}
```

### 4.3 Rejection Loop

If VERDICT `pass: false`:
1. Orchestrator sends `specific_fix` back to the working agent
2. Working agent fixes and re-issues HANDOFF (max 2 retries)
3. If 3rd attempt still fails: Orchestrator notifies user with full context
4. User intervenes via Claude app

---

## 5. Self-Scheduling Logic

Orchestrator priority order:
1. Any item in `ACTIVE.md` marked `Status: Open` with severity `Critical`
2. Any item in `ACTIVE.md` marked `Status: Open` with severity `Major`
3. `EXECUTION-PLAN.md` items under `🔴 CRITICAL` not yet `✅ Done`
4. `EXECUTION-PLAN.md` items under `🟠 MAJOR` not yet `✅ Done`
5. `EXECUTION-PLAN.md` items under `🟡 MEDIUM` not yet `✅ Done`
6. Roadmap items (`docs/planning/c4k-build-roadmap.md`) Phase 1 → Phase 5

Within the same severity, Orchestrator picks the item whose `depends on` chain is fully resolved.

---

## 6. Obsidian Integration

### 6.1 Files the ecosystem writes to

| File | Written by | When |
|---|---|---|
| `C4K-Brain/ACTIVE.md` | Guardian | When a bug is resolved — changes `Status: Open` → `Status: Fixed` |
| `C4K-Brain/EXECUTION-PLAN.md` | Orchestrator | After Guardian PASS — changes `⬜` → `✅` |
| `C4K-Brain/agent-graph.md` | Orchestrator | After every task — appends `[[session note]]` wikilink |
| `C4K-Brain/sessions/YYYY-MM-DD-<task>.md` | Guardian | One note per completed task |

### 6.2 Session note format

```markdown
# <task description>
**Date:** YYYY-MM-DD
**Agent:** Structure | Soul
**Status:** ✅ Pass | ❌ Rejected → fixed → ✅ Pass

## What changed
- `src/components/MetaPreview/MetaPreview.less` — overflow fix

## Handoff summary
<what_was_done from HANDOFF>

## Guardian verdict
<findings from VERDICT>

## Linked bugs resolved
- [[ACTIVE — Detail Page Summary Hidden]]
```

### 6.3 agent-graph.md (Obsidian Graph View)

```markdown
# C4K Agent Ecosystem

## Nodes
[[C4K Orchestrator]]
[[Structure Agent]]
[[Soul Agent]]
[[Guardian Agent]]

## Sessions
[[2026-03-26 — MetaPreview overflow fix]]
[[2026-03-26 — Settings scroll fix]]
```

Obsidian's graph view renders these wikilinks as a live node graph that grows over time.

---

## 7. iPhone Dispatch Flow

1. Open Claude app on iPhone
2. Say: **"Run C4K Orchestrator — next task"**
3. Paste or share `C4K-Brain/ACTIVE.md` and `C4K-Brain/EXECUTION-PLAN.md` content if needed
4. Orchestrator picks task, dispatches agent, returns VERDICT
5. If Guardian rejects: Claude app surfaces the failure message
6. Open Obsidian to see updated graph + session notes

**Files you edit on iPhone to steer work:**
- `C4K-Brain/ACTIVE.md` — add a new bug, bump severity to Critical
- `C4K-Brain/EXECUTION-PLAN.md` — reprioritize, add a feature, mark something blocked

---

## 8. Agent File Locations

```
~/.claude/agents/
  c4k-orchestrator.md
  c4k-structure.md
  c4k-soul.md
  c4k-guardian.md
```

These are markdown persona files. Each contains:
- Identity and role
- File ownership rules
- Specialization context (C4K-specific)
- HANDOFF / VERDICT format to emit
- Rejection loop behavior

---

## 9. Token Budget

| Scenario | Agents active | Est. token multiplier |
|---|---|---|
| Single bug fix | Orchestrator + Structure + Guardian | ~3x |
| AI feature work | Orchestrator + Soul + Guardian | ~3x |
| Full audit | Orchestrator + Structure + Soul + Guardian | ~4x |
| Old approach (everything) | 1 large context | ~1x but slow and unfocused |

The 3x cost buys: domain specialization, Guardian rejection loop, Obsidian audit trail, autonomous scheduling.

---

## 10. Out of Scope

- No agent writes to `tests/` except Guardian
- No agent modifies `package.json` dependencies without Orchestrator approval
- No agent pushes to git — git operations are always user-confirmed
- No agent reads each other's context windows — all communication is via HANDOFF/VERDICT contracts only
