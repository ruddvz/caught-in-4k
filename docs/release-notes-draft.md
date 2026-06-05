# Release Notes (Draft)

## Unreleased — Stremio parity & iOS PWA rebuild

### Safety & hygiene

- Removed tracked `.env.local`; use `.env.example` only for placeholders.
- Standardized on pnpm; removed npm `package-lock.json`.
- GPL-2.0 license metadata aligned with Stremio-derived codebase.
- Webpack build commit hash fallback for CI without `.git`.

### Coming in this release train

- Stremio runtime dependency parity
- Provider architecture migration
- Player safe areas, subtitles, media session
- iOS PWA manifest and offline/update flows
- Cinematic Gold Glass design tokens
- Security hardening for API proxy, Stripe, Supabase
