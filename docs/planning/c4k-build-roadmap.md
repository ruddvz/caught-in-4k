# Caught in 4K — What to Build Next
## Roadmap mapped from repo recommendations to your actual project

---

## How to read this

Each item has:
- **What to build** — the actual feature
- **Why** — why it matters for C4K specifically
- **Resource** — which repo/tool to use
- **Effort** — Low / Medium / High
- **Priority** — based on impact vs effort

---

## PHASE 1 — Fix & Polish (Do First)
> These have the highest impact for the least work. The site needs these before anything else.

---

### 1.1 — Tabler Icons (replace or supplement current icons)
**What:** Swap out any missing, inconsistent, or low-quality icons across the app with Tabler Icons.
**Why:** 5,000+ free SVG icons, MIT licensed, designed for dark UIs — perfect fit for C4K's aesthetic. Your current nav uses custom icons that may not be consistent.
**Resource:** `tabler/tabler-icons` — install via `pnpm add @tabler/icons-react`
**Files affected:** `src/components/NavBar/`, any route using icon buttons
**Effort:** Low
**Priority:** HIGH

---

### 1.2 — Animate.css for micro-interactions
**What:** Add entrance animations to Canon Take boxes, cards loading in, and page transitions.
**Why:** The app feels static right now. Small animations on MetaItems appearing, Canon Takes fading in, and the hero shelf transitioning would make it feel premium.
**Resource:** `animate-css/animate.css` — add classes like `animate__fadeIn`, `animate__slideInUp`
**Files affected:** `src/components/CanonTakeBox/`, `src/routes/Board/HeroShelf/`, `src/components/MetaItem/`
**Effort:** Low
**Priority:** HIGH

---

### 1.3 — Web Performance Optimization (WPO)
**What:** Run an audit and fix the biggest load time issues — image compression, lazy loading, bundle size.
**Why:** GitHub Pages is already slow. Canon Takes and movie posters make it worse. Fixing this improves every user's experience.
**Resource:** `davidsonfellipe/awesome-wpo` — use Lighthouse, imagemin for assets, webpack-bundle-analyzer
**What to do specifically:**
- Add `webpack-bundle-analyzer` to see what's bloating the bundle
- Compress all images in `assets/images/` with imagemin or squoosh
- Lazy load MetaItem poster images (already have `Image` component — add `loading="lazy"`)
- Enable gzip in `http_server.js` for self-hosted version
**Effort:** Medium
**Priority:** HIGH

---

## PHASE 2 — AI Upgrade (Big Differentiator)
> C4K's Canon Takes are the unique feature. Make them better and more diverse.

---

### 2.1 — Add more free LLM APIs as Canon Takes sources
**What:** Right now Canon Takes use only Pollinations.AI. Add 1-2 more free LLM APIs as additional fallbacks or for variety.
**Why:** Pollinations can be slow or rate-limited. Having alternatives means Canon Takes load faster and more reliably.
**Resource:** `cheahjs/free-llm-api-resources`, `mnfst/awesome-free-llm-apis`
**Best free options to add to `pollinationsApi.js`:**
- **OpenRouter free tier** — multiple models, generous free limits, no key needed for some
- **Hugging Face Inference API** — free tier, good for text generation
- **Groq API** — extremely fast, generous free tier (requires free account key)
**Files affected:** `src/common/pollinationsApi.js`, `src/services/BackgroundAgents/C4KBackgroundAgents.js`
**Effort:** Medium
**Priority:** HIGH

---

### 2.2 — AI-generated movie poster backgrounds (Pollinations Image API)
**What:** For movies with no backdrop image, generate an AI image using Pollinations image API (already partially set up in `pollinationsApi.js`).
**Why:** Some movies/shows have missing or low-res backdrops. AI-generated art as fallback looks way better than a blank.
**Resource:** Pollinations image API — already in your codebase at `pollinationsApi.js`
**Files affected:** `src/components/Image/Image.tsx` (add AI fallback), `src/routes/Board/HeroShelf/`
**Effort:** Medium
**Priority:** MEDIUM

---

### 2.3 — Satisfaction Meter AI one-liners
**What:** The `generateSatisfactionOneLiner` function already exists in `pollinationsApi.js` but may not be fully wired up. Complete the integration so every movie's satisfaction score has an AI-generated one-liner displayed.
**Why:** This is a unique C4K feature that differentiates it. Making it visible and prominent adds to the Gen Z personality of the app.
**Files affected:** `src/components/SatisfactionMeterBar/`, `src/common/useSatisfactionMeter.ts`
**Effort:** Low–Medium
**Priority:** MEDIUM

---

## PHASE 3 — Backend & Security
> Before any public launch, these need to be in place.

---

### 3.1 — Rate limiting on api-proxy.js
**What:** Add rate limiting to the Express proxy so nobody can spam your Gemini fallback endpoint and rack up costs.
**Why:** `api-proxy.js` has no rate limiting right now. Anyone who finds the URL can hammer it.
**Resource:** `express-rate-limit` (from `stevemao/awesome-express`)
**What to add to `api-proxy.js`:**
```js
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({ windowMs: 60000, max: 30 });
app.use('/api/', limiter);
```
**Effort:** Low
**Priority:** HIGH (before public launch)

---

### 3.2 — Security headers
**What:** Add basic HTTP security headers to `api-proxy.js` and `http_server.js`.
**Why:** No CORS restrictions, no CSP, no X-Frame-Options currently. Basic hardening takes 10 minutes.
**Resource:** `guardrailsio/awesome-python-security` (same principles apply to Node.js) + `helmet.js`
**What to add:**
```js
const helmet = require('helmet');
app.use(helmet());
```
**Files affected:** `api-proxy.js`, `http_server.js`
**Effort:** Low
**Priority:** HIGH (before public launch)

---

### 3.3 — API endpoint security
**What:** Validate and sanitize all inputs to `api-proxy.js` — title, year, genres fields.
**Why:** Currently only basic validation. Needs input length limits and type checks.
**Resource:** `awesome-api-security` patterns + `express-validator`
**Effort:** Low
**Priority:** MEDIUM

---

## PHASE 4 — SEO & Discoverability
> Currently the site has zero SEO. These changes make it findable.

---

### 4.1 — Meta tags and Open Graph
**What:** Add proper `<title>`, `<meta description>`, Open Graph tags, and Twitter card tags to the HTML.
**Why:** Right now if someone shares a C4K link on WhatsApp or Twitter, it shows nothing. With OG tags it shows a preview card with the C4K logo and tagline.
**Resource:** `marcogrcr/awesome-seo`
**What to add to `webpack.config.js` HtmlWebpackPlugin template:**
```html
<meta name="description" content="Caught in 4K — Raw. Real. Rated.">
<meta property="og:title" content="Caught in 4K">
<meta property="og:description" content="Raw. Real. Rated.">
<meta property="og:image" content="/assets/images/[your-og-image].png">
```
**Effort:** Low
**Priority:** HIGH

---

### 4.2 — Google Analytics (self-hosted alternative)
**What:** Add analytics to see who's visiting, what they're watching, where they drop off.
**Why:** You need data to know what to build next. Right now you're flying blind.
**Resource:** `sugarshin/awesome-google-analytics` for GA4 setup, OR `awesome-selfhosted` for Plausible/Umami (privacy-friendly, free, self-hostable)
**Recommendation:** Use **Plausible** or **Umami** — they're free, self-hostable, no cookies, GDPR compliant, and take 10 minutes to set up on Vercel.
**Effort:** Low
**Priority:** HIGH

---

### 4.3 — PWA improvements
**What:** The `manifest.json` exists but the PWA experience can be improved — better install prompt, offline fallback page, app shortcuts.
**Why:** C4K already has a service worker. Polishing the PWA means users can install it on their phone and it behaves like a native app.
**Resource:** `davidsonfellipe/awesome-wpo` — Workbox (already in your webpack config)
**Files affected:** `manifest.json`, `webpack.config.js` (WorkboxWebpackPlugin already configured)
**Effort:** Medium
**Priority:** MEDIUM

---

## PHASE 5 — UI Upgrades
> Visual improvements that make the app feel more premium.

---

### 5.1 — Modern JS refactor of older files
**What:** The codebase mixes `require()` and `import` — older files use CommonJS. Gradually migrate to ES modules.
**Why:** Consistency, better tree-shaking, easier for Claude Code to work with.
**Resource:** `mbeaudru/modern-js-cheatsheet`
**Effort:** Medium (do gradually, not all at once)
**Priority:** LOW

---

### 5.2 — React component best practices audit
**What:** Audit the larger components (MetaPreview at 410 lines, Player.js at 1069 lines) for performance issues — unnecessary re-renders, missing memoization, prop drilling.
**Why:** These are the heaviest components and any performance issues there affect the whole app.
**Resource:** `enaqx/awesome-react` — specifically React performance patterns section
**Files affected:** `src/components/MetaPreview/MetaPreview.js`, `src/routes/Player/Player.js`
**Effort:** High
**Priority:** LOW (Phase 5)

---

## Build Order Summary

| Phase | What | Priority |
|-------|------|----------|
| 1.1 | Tabler Icons | HIGH |
| 1.2 | Animate.css micro-interactions | HIGH |
| 1.3 | Performance audit + image compression | HIGH |
| 3.1 | Rate limiting on proxy | HIGH |
| 3.2 | Security headers (helmet.js) | HIGH |
| 4.1 | OG meta tags | HIGH |
| 4.2 | Analytics (Plausible/Umami) | HIGH |
| 2.1 | More free LLM fallbacks | HIGH |
| 2.2 | AI poster fallbacks | MEDIUM |
| 2.3 | Satisfaction Meter one-liners | MEDIUM |
| 3.3 | API input validation | MEDIUM |
| 4.3 | PWA improvements | MEDIUM |
| 5.1 | Modern JS refactor | LOW |
| 5.2 | Heavy component audit | LOW |

---

## What to do RIGHT NOW (today)

If you want to start immediately, do these three — they're all LOW effort, HIGH impact:

1. **OG meta tags** — makes every shared link look professional
2. **Rate limiting + helmet.js** — 20 minutes of work, protects the proxy
3. **Tabler Icons** — one install command, instant visual upgrade
