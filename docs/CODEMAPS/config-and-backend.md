# Configuration, Backend & CI/CD

## Build Configuration

### webpack.config.js (257 lines)
- **Entry points**: `./src/index.js` (app) + `./node_modules/@stremio/stremio-core-web/worker.js` (WASM worker)
- **Output**: `build/<COMMIT_HASH>/scripts/[name].js`
- **Loaders**:
  - `.js` → babel-loader (preset-env + preset-react)
  - `.ts/.tsx` → ts-loader (happyPackMode)
  - `.less` → MiniCssExtract → css-loader (CSS Modules: `[local]-[hash:base64:5]`) → postcss → less-loader
  - `.ttf, .png/.jpg/.svg, .wasm` → asset/resource
- **thread-loader** for parallel compilation
- **Aliases**: `stremio` → `src/`, `stremio-router` → `src/router/`
- **Extensions**: `.tsx, .ts, .js, .json, .less, .wasm`
- **Dev server**: HTTPS on `0.0.0.0`, no hot/live reload
- **Environment vars**: `SENTRY_DSN, REACT_APP_CANON_PROXY_URL, SERVICE_WORKER_DISABLED, DEBUG, VERSION, COMMIT_HASH`

### tsconfig.json (23 lines)
- Target: ESNext + DOM
- JSX: `react` (classic)
- baseUrl: `./src` with alias `stremio/*` → `*`
- strict mode, allowJs, noCheck on JS

### eslint.config.mjs (103 lines)
- ESLint v9 flat config
- Plugins: @eslint/js, typescript-eslint, eslint-plugin-react, @stylistic
- 4-space indent, single quotes, semicolons
- `no-console: error` (allows warn/error)
- `no-explicit-any: off` (relaxed for TS migration)
- Globals: `YT, FB, cast, chrome`

### package.json
- **Name**: `caught-in-4k` v1.0.0-genesis
- **Node**: 20 (via .nvmrc)
- **Key deps**: React 18, stremio-core-web 0.54.1, stremio-video 0.0.70, Express 5, i18next, Sentry
- **Scripts**: `start` (webpack-dev-server), `build` (webpack prod), `test` (jest), `lint` (eslint src)

---

## Backend

### api-proxy.js (110 lines) — Port 3001
Express server proxying Gemini API calls. Keeps `GEMINI_API_KEY` secret.

**Endpoint**: `POST /api/canon-take`

**Request**: `{ title: string, year: number, genres: string, imdbRating: number }`

**Behavior**:
1. Validates POST + required fields
2. Reads `GEMINI_API_KEY` from env
3. Builds system prompt for Gemini (Gen Z movie summary, max 3 sentences)
4. Calls `gemini-2.0-flash:generateContent` (max 120 tokens, temp 0.7)
5. Returns `{ canonTake: "..." }`

### api-proxy-template.js (134 lines) — `scripts/deployment/`
Same logic as api-proxy.js but exported as `module.exports = handler` for serverless deployment (Vercel/Netlify).

### http_server.js (29 lines) — `scripts/utilities/`
Simple production static server for Docker. Serves `build/` on port 8080.
- `index.html` → 2-hour cache
- Other assets → ~1-month cache
- Catch-all SPA fallback

---

## Docker

### Dockerfile (42 lines)
Multi-stage build:
1. `base`: node:20-alpine + pnpm
2. `app`: `pnpm install` + `pnpm build`
3. `server`: express@4 only
4. `final`: http_server.js + build/ on port 8080

---

## CI/CD (GitHub Actions)

### `.github/workflows/build.yml`
- **Triggers**: Push to `development`/`main`, PRs, manual
- **Steps**: pnpm install → lint (continue-on-error) → test (continue-on-error) → build (`PUBLIC_PATH=/caught-in-4k/`)
- **Deploy**: GitHub Pages via `peaceiris/actions-gh-pages@v4` (main only)

### `.github/workflows/release.yml`
- **Triggers**: GitHub Release published
- **Steps**: Build with SENTRY_DSN → zip → upload as release asset

### `.github/workflows/auto_assign.yml`
- Auto-assigns PRs to author
- Labels PRs/issues by conventional commit prefix

---

## Tests

### Framework: Jest 29.7 (unit) + Playwright (E2E, no test files yet)

| File | Lines | What It Tests |
|------|-------|---------------|
| `tests/copyright.spec.js` | 23 | Every .js/.less file in src/ starts with copyright header |
| `tests/i18nScan.test.js` | 108 | AST scan for hardcoded strings not wrapped in `t()` |
| `tests/routesRegexp.spec.js` | 359 | Route regex matching/non-matching patterns |

---

## Assets

| Directory | Contents |
|-----------|----------|
| `assets/favicons/` | `favicon.ico` |
| `assets/fonts/` | `PlusJakartaSans.ttf` (176 KB) |
| `assets/images/` | 22 images: logos, icons, backgrounds, placeholders |
| `assets/images/avatars/` | 20 C4K custom avatars (`c4k-avatar-1.png` through `c4k-avatar-20.png`) |
| `assets/screenshots/` | PWA store screenshots |

---

## Key Environment Variables

| Variable | Where Used | Purpose |
|----------|-----------|---------|
| `GEMINI_API_KEY` | api-proxy.js | Gemini API authentication (server-side only!) |
| `REACT_APP_CANON_PROXY_URL` | Frontend | URL of the Canon Takes proxy |
| `SENTRY_DSN` | webpack/release | Sentry error tracking |
| `SERVICE_WORKER_DISABLED` | webpack | Toggle service worker |
| `DEBUG` | webpack | Debug mode flag |
