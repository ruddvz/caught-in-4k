# Implementation Blockers

Items that cannot be completed without owner credentials, deployment access, or a product decision.

| Item | Blocker | Next action |
|---|---|---|
| Stripe live webhook verification | Requires `STRIPE_WEBHOOK_SECRET` and deployed endpoint | Owner configures Stripe dashboard → webhook URL |
| Supabase RLS live verification | Requires project with migrations applied | Run against owner Supabase project |
| Production access keys rotation | If real keys were ever committed | Owner rotates `C4K_ACCESS_KEYS` |
| Visual regression baselines | May need golden image approval | Review `test-results/visual/` after first CI run |

_No blockers recorded for Phase 00._
