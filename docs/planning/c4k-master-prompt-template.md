# Caught in 4K — Master Prompt Template
## Use this as the base for EVERY task you give Claude Code

---

```
## MANDATORY SETUP — READ BEFORE DOING ANYTHING

Before touching any code, do the following in order:

1. Read `.github/workflow-101.md` in full and follow phases 0–8 as a checklist.
2. Read `docs/CODEMAPS/OVERVIEW.md` for project architecture.
3. Based on the task below, read ONLY the relevant CODEMAPS files:
   - Layout/UI/component work  → `docs/CODEMAPS/components.md`
   - Route/page work           → `docs/CODEMAPS/routes.md`
   - App shell, routing, nav   → `docs/CODEMAPS/app-shell.md`
   - Hooks, utilities, context → `docs/CODEMAPS/common.md`
   - Backend, API, CI/CD, build→ `docs/CODEMAPS/config-and-backend.md`
   - Services, Canon Takes     → `docs/CODEMAPS/services.md`
   - TypeScript types          → `docs/CODEMAPS/types.md`
4. Do NOT scan the full codebase. The CODEMAPS tell you exactly which files to open.
   Use them as your map. Only open the specific files listed there that are relevant.
5. Use the available agents and commands from `everything-claude-code/` where applicable:
   - Planning a feature  → `/plan` command or planner agent
   - Writing/fixing code → `/build-fix` command
   - Reviewing code      → `/code-review` command or code-reviewer agent
   - TypeScript work     → typescript-reviewer agent
   - Deployment          → deployment-patterns skill
   - TDD                 → `/tdd` command

---

## Project Identity — Read This Every Time

Name: Caught in 4K (C4K)
Tagline: Raw. Real. Rated. (always with periods, always this exact casing)
What it is: A movie/show streaming catalog with AI-powered Canon Takes.
It is NOT described as a fork of another product in any user-facing text. It is its own product.
Stack: React 18 + TypeScript + LESS (CSS Modules) + Webpack 5
Deploy: GitHub Pages via GitHub Actions (gh-pages branch)
Run locally: pnpm start → http://localhost:3000

---

## Canon Takes — How AI Works in This App

PRIMARY: Pollinations.AI — free, no API key required, called directly from frontend.
  File: src/common/pollinationsApi.js
  Flow: C4KBackgroundAgents → pollinationsApi.js → https://text.pollinations.ai → localStorage cache → CanonTakeBox

FALLBACK ONLY: api-proxy.js (Express, port 3001) → Gemini API.
  Only activates if Pollinations fails AND REACT_APP_CANON_PROXY_URL is exported in the shell or CI environment.
  If that env variable is not set, Gemini is never called at all.

Do NOT treat Gemini as the main API.
Do NOT add any API key to frontend code.
Do NOT modify the Canon Takes flow unless the task explicitly requires it.

Other free LLM APIs available as future fallbacks (do not add unless explicitly asked):
OpenRouter free tier, Hugging Face Inference API, Groq API free tier.

---

## Task
[REPLACE THIS: One clear sentence stating exactly what needs to be done.]

---

## Context — Relevant Files (from CODEMAPS)
[REPLACE THIS: List only the specific files relevant to this task. Copy paths from CODEMAPS.]

Examples:
- src/routes/Intro/Intro.js (427 lines) — Login/signup page at #/intro
- src/components/AppLogo/AppLogo.js (30 lines) — Logo with optional tagline
- src/routes/Settings/Settings.tsx (50 lines) — Settings 2-column layout
- src/App/caught-in-4k-theme.less — CSS variables and theme tokens
- assets/images/ — Logo files, look for red-dot transparent background version

---

## Requirements
[REPLACE THIS: Numbered list of every specific thing the result must do or look like.]

1.
2.
3.

---

## UI / UX Expectations
[Include for any task involving visual output. Delete if purely logic/backend.]

- Mobile-first. Must work correctly at 375px width minimum.
- Match the visual language of TopNavigationBar:
  File: src/components/NavBar/TopNavigationBar/TopNavigationBar.tsx
- Use only existing CSS variables from src/App/caught-in-4k-theme.less — no hardcoded colors.
  Key variables:
    --primary-accent-color: rgb(0, 240, 255)         (Cyan)
    --secondary-accent-color: rgba(157, 78, 221, 1)  (Violet)
    --primary-background-color: rgba(8, 6, 16, 1)    (Deep black)
    --outer-glow: 0 0 20px rgba(0, 240, 255, 0.35)   (Cyan glow)
- Font: PlusJakartaSans (assets/fonts/PlusJakartaSans.ttf) — already loaded globally.
- Icons: use Tabler Icons (@tabler/icons-react) for any new icons needed.
- Animations: use Animate.css classes (animate__fadeIn, animate__slideInUp, etc.)
  for entrance animations. Do not write custom keyframes unless Animate.css cannot cover it.
- Interactive states: every user action needs visible feedback —
  loading, success, error, empty state. No silent failures.

---

## Behavior / Logic
[Include for any task involving functionality. Delete if purely visual.]

- Data flows through useModelState → WASM core (@stremio/stremio-core-web) → React re-render.
- Any new hook must follow the pattern in src/common/useModelState.js.
- Module aliases: stremio/common, stremio/components, stremio/services, stremio-router.
- All routes are wrapped with withCoreSuspender HOC — do not remove or bypass this.
- Hash-based routing: #/intro, #/, #/settings, #/discover, etc.
- CSS Modules with LESS: class names compile to [local]-[hash:base64:5].
- localStorage is used for Canon Takes cache — key: c4k_canon_take_${title}_${year}.
- New user-facing strings must use useTranslate() and be added to
  src/common/caught-in-4k-translations.js.

---

## Security & Performance Rules
[Always apply these, regardless of task type.]

- Never put API keys, secrets, or credentials in frontend code.
- Never commit .env.local — use .env.example as the template.
- api-proxy.js has rate limiting (express-rate-limit) and security headers (helmet) — do not remove them.
- Images should use loading="lazy" wherever possible.
- Do not add heavyweight packages — consider bundle impact before adding anything new.

---

## SEO & Meta Rules
[Apply when touching HTML templates or webpack config.]

- HTML template must include:
    <meta name="description" content="Caught in 4K — Raw. Real. Rated.">
    <meta property="og:title" content="Caught in 4K">
    <meta property="og:description" content="Raw. Real. Rated.">
    <meta property="og:image" content="/assets/images/[og-image].png">
- Do not reference the legacy product name (`Stremio`) in any user-facing text, meta tag, or page title.
- Page title format: "Caught in 4K" or "Caught in 4K — [Page Name]"

---

## What NOT To Do
[REPLACE THIS: Add task-specific rules. The rules below always apply to every task.]

- Do not scan the full src/ directory — use CODEMAPS to navigate.
- Do not modify caught-in-4k-theme.less CSS variables — only consume them.
- Do not modify README.md — handled separately.
- Do not change any route URL paths — only component internals.
- Do not touch the navbar (TopNavigationBar) unless it is the explicit subject of this task.
- Do not add new npm packages without flagging them and explaining why they are needed.
- Do not reference the legacy product name (`Stremio`), "fork", "add-ons", or "Gemini API key" in any user-facing text.
- Do not leave placeholder comments like "// add logic here" — implement fully or flag it explicitly.
- Do not rewrite working code while fixing something else — minimum footprint changes only.

---

## Output Expected
- Implement fully — no placeholders, no "you can fill in the rest."
- List every file modified with a one-line description of what changed.
- After completing, give the exact command to verify locally:
  pnpm start → open http://localhost:3000/#/[route]
- Do not ask for confirmation before starting — implement everything.
- Session handoff at the end:
  1. What was completed
  2. Anything incomplete or broken
  3. Exact next step to continue
```

---

## How To Use This Template

1. Copy everything inside the code block above.
2. Fill in Task and Context with your specific details.
3. Fill in Requirements with everything you want done.
4. Add task-specific rules to the What NOT To Do section.
5. Delete sections that don't apply to your task.
6. Paste into Claude Code.

---

## Quick Reference — Key File Paths

### Pages (Routes)
| What | File | URL |
|------|------|-----|
| Login / Signup | `src/routes/Intro/Intro.js` | `#/intro` |
| Home / Board | `src/routes/Board/Board.js` | `#/` |
| Settings | `src/routes/Settings/Settings.tsx` | `#/settings` |
| Discover | `src/routes/Discover/Discover.js` | `#/discover` |
| Library | `src/routes/Library/Library.js` | `#/library` |
| Profile selector | `src/routes/Profiles/Profiles.js` | `#/profiles` |
| Player | `src/routes/Player/Player.js` | `#/player/...` |
| Addons | `src/routes/Addons/Addons.js` | `#/addons` |
| Calendar | `src/routes/Calendar/Calendar.tsx` | `#/calendar` |
| Terms of Service | `src/routes/Tos/Tos.js` | `#/tos` |
| Privacy Policy | `src/routes/PrivacyPolicy/PrivacyPolicy.js` | `#/privacy` |

### UI Components
| What | File |
|------|------|
| Logo + tagline | `src/components/AppLogo/AppLogo.js` |
| Top navbar (C4K) | `src/components/NavBar/TopNavigationBar/TopNavigationBar.tsx` |
| Movie/show card | `src/components/MetaItem/MetaItem.js` |
| Large preview panel | `src/components/MetaPreview/MetaPreview.js` |
| Canon Take box | `src/components/CanonTakeBox/CanonTakeBox.js` |
| Satisfaction meter bar | `src/components/SatisfactionMeterBar/SatisfactionMeterBar.js` |
| Modal dialog | `src/components/ModalDialog/ModalDialog.js` |
| Hero carousel | `src/routes/Board/HeroShelf/HeroShelf.js` |
| Board stats section | `src/components/BoardStatsSection/BoardStatsSection.js` |

### Styles & Config
| What | File |
|------|------|
| CSS variables / theme | `src/App/caught-in-4k-theme.less` |
| Route → component map | `src/App/routerViewsConfig.js` |
| All route regex patterns | `src/common/routesRegexp.js` |
| C4K translation strings | `src/common/caught-in-4k-translations.js` |
| Webpack config | `webpack.config.js` |
| Environment variables | shell / CI exports + `.env.example` |

### AI & Backend
| What | File | Notes |
|------|------|-------|
| Canon Takes — PRIMARY | `src/common/pollinationsApi.js` | Pollinations.AI, free, no key |
| Canon Takes — background queue | `src/services/BackgroundAgents/C4KBackgroundAgents.js` | Fetch + cache logic |
| Canon Takes — fallback path | `api-proxy.js` | Gemini proxy, only if env var is exported |
| Canon Takes — hook | `src/common/useCanonTakes.ts` | State management |
| Satisfaction meter | `src/common/useSatisfactionMeter.ts` | Score + tier logic |
| AI image generation | `src/common/pollinationsApi.js` | `generateImage()` for poster fallbacks |

### Assets
| What | Where |
|------|-------|
| Logo images | `assets/images/` — red-dot transparent background version |
| Custom avatars | `assets/images/avatars/` — c4k-avatar-1 through c4k-avatar-20 |
| App font | `assets/fonts/PlusJakartaSans.ttf` |
| Favicons | `assets/favicons/favicon.ico` |

### Installed UI Libraries (already in package.json — use these, do not add alternatives)
| Library | Purpose | How to use |
|---------|---------|-----------|
| `@tabler/icons-react` | SVG icons | `import { IconName } from '@tabler/icons-react'` |
| `animate.css` | Entrance/exit animations | Add CSS class `animate__animated animate__fadeIn` |
| `react-focus-lock` | Accessible modals | Already used in ModalDialog |
| `use-long-press` | Long press events | Already used in MetaItem |
| `i18next` + `react-i18next` | Translations | `useTranslate()` hook from stremio/common |

### Everything Claude Code Commands
| Command / Agent | Use for |
|----------------|---------|
| `/plan` | Planning a new feature before writing any code |
| `/build-fix` | Writing new code or fixing broken code |
| `/code-review` | Reviewing a completed change for quality |
| `/tdd` | Test-driven development |
| `planner agent` | Complex multi-file feature planning |
| `typescript-reviewer agent` | TypeScript type errors or type design |
| `code-reviewer agent` | Deep code quality and pattern review |
| `deployment-patterns skill` | Deployment, CI/CD, GitHub Actions tasks |

### Build Roadmap Priority (for planning sessions)
| Priority | What |
|----------|------|
| HIGH | OG meta tags, rate limiting, helmet.js security headers |
| HIGH | Tabler Icons consistency, Animate.css micro-interactions |
| HIGH | Performance audit — image compression, lazy loading, bundle size |
| HIGH | More free LLM fallbacks for Canon Takes |
| MEDIUM | AI poster fallbacks via Pollinations image API |
| MEDIUM | Satisfaction Meter one-liners fully wired up |
| MEDIUM | PWA improvements — offline page, app shortcuts |
| MEDIUM | Plausible/Umami analytics (self-hosted, free, no cookies) |
| LOW | Modern JS refactor — migrate require() to import |
| LOW | MetaPreview + Player.js performance audit (memoization) |
