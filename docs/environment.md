# Environment Variables

Copy `.env.example` to `.env.local` for local development. **Never commit** `.env.local` or production secrets.

## Frontend (`REACT_APP_*`)

| Variable | Required | Used for |
|---|---|---|
| `REACT_APP_CANON_PROXY_URL` | No | Canon Takes Gemini proxy fallback when Pollinations is unavailable |
| `REACT_APP_API_BASE_URL` | No | Billing/admin API when frontend is static (e.g. GitHub Pages) |
| `REACT_APP_SUPABASE_URL` | For auth | Supabase project URL |
| `REACT_APP_SUPABASE_ANON_KEY` | For auth | Supabase anon key (RLS-protected) |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | For subscribe | Stripe Checkout publishable key |

## Access gate

| Variable | Required | Used for |
|---|---|---|
| `C4K_ACCESS_KEYS` | No | Comma-separated invite keys; empty disables gate (recommended locally) |

## Backend (`api-proxy.js` only)

| Variable | Required | Used for |
|---|---|---|
| `APP_BASE_URL` | For Stripe redirects | Public app URL for success/cancel |
| `ALLOWED_APP_ORIGINS` | No | Extra CORS origins |
| `STRIPE_SECRET_KEY` | For billing | Stripe server API |
| `STRIPE_WEBHOOK_SECRET` | For entitlements | Webhook signature verification |
| `SUPABASE_URL` | For server writes | Same project as frontend |
| `SUPABASE_SERVICE_ROLE_KEY` | For admin/server | **Never** expose to frontend |

## Build / CI

| Variable | Required | Used for |
|---|---|---|
| `COMMIT_HASH` | No | Webpack build id when `.git` is missing |
| `GITHUB_SHA` | No | CI fallback for commit hash |

## Webpack-injected

`VERSION` and commit hash are set at build time from `package.json` and git/env.
