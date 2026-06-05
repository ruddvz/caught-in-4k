# Release Notes (Draft)

## Shipped — Stremio parity & iOS PWA rebuild

### Safety & hygiene

- Removed tracked `.env.local`; use `.env.example` only for placeholders.
- Standardized on pnpm; GPL-2.0 license metadata aligned with Stremio-derived codebase.
- Webpack build commit hash fallback for CI without `.git`.

### Stremio parity (phases 00–11)

- Stremio runtime dependency parity (core-web, icons, video, webpack, workbox).
- `CoreProvider` architecture; Calendar route; Discover empty-filter crash fix.
- Gamepad provider + navigation (analog focus, A confirm, B back); Settings toggle.
- Player: safe areas, Safari fullscreen, `useSubtitles`, HDR badge, control-bar a11y labels.
- Settings dashboard: Interface, Streaming, About sections.
- PWA: manifest, iOS meta, offline/update banners, install prompt, Workbox verification.
- API proxy Zod validation; `POST /api/access/verify`; optional client server verify.
- Supabase RLS migration artifact + policy tests.
- Cinematic Gold Glass tokens; README/DESIGN updates; visual regression capture script.
- CI: lint, test, i18n scan, build, service-worker verify, Playwright e2e.

### Owner environment (manual)

- Apply Supabase RLS migration on production project and verify policies.
- Configure Stripe webhook secret + live endpoint verification.
- Review first `test-results/visual/` capture from CI.
