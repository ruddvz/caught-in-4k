# Security Overview

## Frontend

- Supabase **anon** key only in `REACT_APP_*` variables; RLS must protect user data.
- Stripe **publishable** key only in frontend; entitlements must come from verified backend/webhook state.
- Access keys (`C4K_ACCESS_KEYS`) are invite codes — treat as revocable, not long-lived secrets in client bundles for high-value gating.

## API proxy (`api-proxy.js`)

- CORS allowlist via `APP_BASE_URL` and `ALLOWED_APP_ORIGINS`
- Rate limiting on sensitive routes
- Helmet security headers
- Gemini/Stripe/Supabase secrets server-side only

## Add-ons

- `managedAddonSecurity.js` validates transport URLs and blocks unsafe protocols.
- Add-ons UI copy emphasizes lawful user-configured sources.

## Service worker

- Do not cache authenticated API responses or payment redirects.
- Run `pnpm run verify-service-worker` after production builds.

## Supabase RLS

Verify policies on profile, library, and subscription tables in the owner project. Service role key must never ship to the browser.
