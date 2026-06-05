# Stremio Upstream Sync Notes

Reference upstream: https://github.com/Stremio/stremio-web  
Compared branch/tag: development / v5.0.0-beta.37  
Compared on: 2026-06-05

## Ported

| Upstream item | C4K PR | Files changed | Notes |
|---|---|---|---|
| (in progress) | — | — | See `docs/agent-progress.md` |

## Rejected / Not Applicable

| Upstream item | Reason |
|---|---|
| Full Stremio UI clone | C4K keeps Cinematic Gold Glass identity and C4K-only routes |

## Deferred

| Item | Blocker | Next action |
|---|---|---|
| Live Stripe/Supabase verification | Secrets / deployed env | Document in `implementation-blockers.md` |

## Dependency parity

| Package | Before | After | Upstream | Notes |
|---|---:|---:|---:|---|
| @stremio/stremio-core-web | 0.57.0 | pending | 0.58.0 | Phase 01 |
| @stremio/stremio-icons | 5.8.0 | pending | 5.10.0 | Phase 01 |
| @stremio/stremio-video | 0.0.70 | pending | 0.0.79 | Phase 01 |
