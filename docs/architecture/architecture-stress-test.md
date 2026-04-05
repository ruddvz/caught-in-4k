# C4K Architecture Stress Test
Last updated: 2026-04-05

Stack: React 18 + WASM (stremio-core-web) frontend on GitHub Pages · Express `api-proxy.js` backend · Supabase (auth + PostgreSQL) · Stripe (one-time payments) · Gemini + Pollinations AI

---

## 1. Schema Stress Test

### Current inferred schema (from `api-proxy.js`)

```
users                    → id, email, status, is_admin
subscriptions            → id, user_id, plan (string), price_cents,
                           stripe_payment_intent_id, stripe_session_id,
                           status, expires_at
stripe_payment_reversals → payment_intent_id, event_type, recorded_at
```

### Structural weaknesses at 10K DAU

| Issue | Risk |
|-------|------|
| No `profiles` table | User profiles (avatars, accent colors) live in frontend state/localStorage only — no persistence across devices |
| `plan` stored as string ID | If plan IDs ever change, historical subscription records become unresolvable without a migration |
| Missing DB constraints on `status` | `'active'`/`'cancelled'` enforced only in app code — corrupt states possible via direct DB writes |
| No `devices` table | Pro (2 devices) / Max (4 devices) limits are pure UI fiction — not enforced anywhere in the backend |
| No `canon_takes_cache` table | Every user request for the same movie fires a fresh Gemini API call |
| Query on every checkout | `subscriptions WHERE user_id=X AND status='active' AND expires_at >= NOW()` — needs a composite index on `(user_id, status, expires_at)` |
| No `subscription_events` audit log | Cancellations and renewals leave no trail other than `stripe_payment_reversals` |

### Schema improvements for scale

- Add `profiles(id, user_id, display_name, avatar_id, accent_color)` — one-to-many with users
- Add `devices(id, user_id, device_fingerprint, last_seen)` — enforce device limits server-side
- Add `canon_takes_cache(content_id, type, take_text, generated_at, expires_at)` — skip Gemini for repeated content
- Add a `status` CHECK constraint in Supabase
- Add composite index: `CREATE INDEX ON subscriptions (user_id, status, expires_at DESC)`

---

## 2. Security Blind Spot Audit

### What's already there (good)

- `helmet()` applied before all middleware
- CORS configured with origin allowlist
- Rate limiting: 30/min general, 10/min Canon Takes
- Stripe webhook signature verification via `constructEvent`
- Bearer token verification before every checkout
- Idempotency check for duplicate webhook events

### Vulnerabilities found

| Severity | Issue | Location |
|----------|-------|----------|
| **HIGH** | **Prompt injection** — `title`, `year`, `genres`, `imdbRating` are interpolated directly into the Gemini prompt string with no sanitization. An attacker can craft a body like `title: "Inception\n\nIgnore all instructions..."` | `api-proxy.js:402` |
| **HIGH** | **Device limit not enforced server-side** — Pro=2 devices, Max=4 devices. Nothing in the backend checks this. Anyone with a valid token can stream on unlimited devices | no backend enforcement exists |
| **MEDIUM** | **No request body size limit** on `express.json()` — default is 100KB but should be explicit | `api-proxy.js:357` |
| **MEDIUM** | **PII in server logs** — `console.log` outputs `userId` and `plan` on every checkout | `api-proxy.js:534` |
| **MEDIUM** | **IP-only rate limiting** — trivially bypassed with a rotating proxy. No user-level rate limit on Canon Takes | all rate limiters |
| **LOW** | **Gemini safety settings all `BLOCK_NONE`** — intentional for film content, but means the proxy forwards any generated content | `api-proxy.js:423-438` |
| **LOW** | **No health check endpoint** — no `/health` or `/ping` to verify proxy is alive without hitting a billable API | `api-proxy.js` |

### Mitigations

- Sanitize prompt inputs: strip newlines, limit string lengths, validate types before interpolation
- Add a `POST /api/auth/heartbeat` that records device sessions and enforces plan device caps
- Set `express.json({ limit: '10kb' })`
- Replace PII-logging `console.log` with structured logging that omits user IDs in non-debug modes

---

## 3. Vendor Lock-In & Migration Audit

| Vendor | Lock-in Level | Migration Challenge |
|--------|--------------|---------------------|
| **Supabase** | Critical | Auth and DB are the same service. Migrating auth means migrating sessions AND re-pointing all DB foreign keys simultaneously. Row-level security policies are Supabase-specific SQL |
| **Stripe** | High | Entire subscription lifecycle is deeply coupled to Stripe event shapes. `checkout.session.completed`, `mode: 'payment'`, and `amount_subtotal` validation are all Stripe-specific. Replacing requires rewriting ~250 lines |
| **stremio-core-web WASM** | Critical | All catalog, library, player, and addon state runs through this binary. Every `useModelState` hook and `Load` action dispatch is tightly coupled to Stremio's internal protocol. No abstraction layer |
| **GitHub Pages** | Low | Static deploy, easy to move. But the proxy must be hosted separately — adds operational complexity |
| **Gemini API** | Medium | Model name and API URL hardcoded in `api-proxy.js:409`. Switching to OpenAI or Claude requires changing the fetch call and response shape parser |
| **Pollinations AI** | Medium | Free with no SLA. Unauthenticated access. Terms could change. No retry or fallback if it goes down |

### How to reduce lock-in today (low effort)

- Wrap Gemini calls in a `generateCanonTake(prompt)` function — make the provider swappable in one place
- Abstract the Supabase client behind `UserRepository` / `SubscriptionRepository` interfaces
- Add `APP_AI_PROVIDER=gemini` env var so the proxy can route between providers without code changes

---

## 4. Cost Explosion Simulation

| Service | Free tier | 1K DAU | 10K DAU |
|---------|-----------|--------|---------|
| GitHub Pages | Free | Free | Free |
| Supabase | 500MB DB, 50K MAU, 2GB bandwidth | Still free | **Hits MAU limit** (~$25/mo Pro needed) |
| Stripe | 2.9% + $0.30/txn | Predictable | Predictable |
| Gemini 2.0 Flash | — | ~$0.002/day | ~$0.02/day |
| api-proxy hosting | **Not deployed anywhere visible** | ? | ? |

### The cost driver not yet solved: proxy hosting

There is no `Dockerfile` targeting a production host, no Railway/Render/Fly config, and no GitHub Actions deploy step for the proxy. The proxy is the entire backend — Stripe checkout, Canon Takes, Supabase auth. If it's not running, nothing works. This is the most urgent operational gap.

### Canon Takes cost at scale

- No caching → same movie queried by 100 users = 100 Gemini API calls
- `gemini-2.0-flash` pricing: ~$0.30/1M output tokens
- 10K Canon Take requests/day × 120 output tokens = 1.2M tokens/day = ~$0.36/day (cheap now)
- At 100K DAU with no cache: $3.60/day = **$108/mo** just for Canon Takes
- Adding `canon_takes_cache` would reduce this by ~80%+ (most movies are re-queried)

### What can spike unexpectedly

- Supabase bandwidth on popular content — safe for now (media doesn't go through the proxy), but if thumbnails or posters are ever proxied, bandwidth blows up fast
- Pollinations AI — free today, external service, no SLA

---

## 5. Failure Mode Simulation

| Component | Failure Mode | User Impact |
|-----------|-------------|-------------|
| `api-proxy.js` | **Single Node.js process, no clustering, no PM2, no restart on crash** — one unhandled exception = full backend down | Stripe checkout dead, Canon Takes dead, auth verification dead. No automatic recovery |
| Gemini API | Rate limit or timeout | Canon Takes show skeleton forever (timeout fallback exists, so degrades gracefully) |
| Supabase | Downtime or connection exhaustion | Login broken, checkout broken. Users already in session retain WASM state until refresh |
| stremio-core-web WASM | Init failure | Blank screen on every route — `withCoreSuspender` waits forever, no error state |
| Stripe webhook | DB write fails | Subscription not provisioned — user paid but has no access. Stripe retries but if window expires, provisioning is permanently lost |
| Pollinations AI | Goes down | AI poster generation fails silently, no visible fallback |
| GitHub Pages CDN | Extremely unlikely | Entire frontend inaccessible |

### Monitoring that should exist but doesn't

- No `/health` endpoint on the proxy
- No error alerting (Sentry, etc.)
- No Stripe webhook retry monitoring
- No visibility into WASM core crash rate

### Recommended safeguards

- Run proxy with PM2 (`pm2 start api-proxy.js --name c4k-proxy`) — auto-restart on crash
- Add Stripe webhook dead-letter queue / reconciliation job to catch unprovisioned paid sessions
- Add an error boundary around `withCoreSuspender` showing a user-friendly "loading failed" state

---

## 6. Completion vs. Stability Check

**Honest answer: C4K currently optimizes for feature completion over long-term stability.**

| Technical debt item | Impact |
|---------------------|--------|
| **Device limits are UI-only fiction** | Any paying user can share their token with unlimited devices. Pro/Max distinction is meaningless at the network level |
| **No Canon Takes cache** | Operational cost scales linearly with users instead of with unique content |
| **Single unmanaged Node process** | One crash = full backend outage with no self-healing |
| **No database migrations system** | Schema changes require manual Supabase dashboard work with no audit trail |
| **Mixed CJS/ESM** | `require()` in older files, `import` in newer — bundle larger than necessary, tree-shaking inconsistent |
| **No Stripe webhook reconciliation** | Paid users who hit a DB failure at provisioning time are silently left without access |
| **PLAN.md R4 says "add rate limiting + helmet.js"** — both already exist | Planning docs are out of sync with actual system state |
| **Profiles stored in frontend only** | Multi-device access destroys profile state — a core UX feature with no backend persistence |

### What breaks at 100x scale

1. Single api-proxy process collapses under concurrent Stripe webhooks and Canon Take requests
2. Supabase free tier gives way — MAU and bandwidth limits hit
3. Canon Takes cost grows linearly with no caching
4. Device limits remain unenforceable — Pro vs. Max revenue distinction erodes
5. Profile data loss becomes a user complaint at scale (no cross-device sync)

---

## Priority Fix List

In order of severity:

1. **Deploy the proxy properly** — PM2 + a real host (Railway/Fly/Render). The entire backend has no production deployment story.
2. **Sanitize Canon Takes inputs** — prevent prompt injection before it's exploited. (`api-proxy.js:402`)
3. **Add `canon_takes_cache` table** — cost and latency win, required at scale.
4. **Enforce device limits server-side** — the Pro/Max distinction is currently meaningless.
5. **Add composite index on `subscriptions(user_id, status, expires_at)`** — runs on every checkout.
6. **Add Stripe webhook reconciliation** — paid users shouldn't silently lose access on a DB hiccup.
7. **Add `profiles` table in Supabase** — profile data needs backend persistence.
8. **Wrap Gemini calls in a provider abstraction** — reduces lock-in, enables fallback to OpenRouter/Groq (roadmap R1).
