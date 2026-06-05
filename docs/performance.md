# Performance notes

## Bundle size

Production builds currently emit a large `main` entry (~8.5 MiB combined scripts + CSS per webpack warning). This is expected for a Stremio-derived client with video, core WASM, and UI dependencies.

### Mitigations in place

- Webpack `splitChunks` for vendor/runtime bundles
- Lazy route loading via the existing router/views config
- Workbox precache limited to shell assets

### Recommended follow-ups

- Run `pnpm build` and inspect `build/scripts/*.js` sizes after major dependency bumps
- Avoid importing heavy demo or admin-only modules in the main browse path
- Keep avatar and PWA image assets optimized (several multi-MiB PNGs are flagged in build output)

## Runtime

- Player and MetaDetails use existing skeleton/placeholder patterns to limit layout shift
- Continue Watching scrolls to the in-progress item on load (`Library.js`)
