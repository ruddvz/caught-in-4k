# Caught in 4K — Project Roadmap

A curated development plan focused on polishing the user experience, enhancing AI capabilities (Canon Takes), and preparing for a public launch.

---

## Phase 1: Fix & Polish (Highest Priority)
> Fast-track improvements with high visual and performance impact.

- **1.1: Tabler Icons Migration**
  - **What:** Replace missing or inconsistent icons with [Tabler Icons](https://tabler-icons.io/).
  - **Why:** MIT licensed, designed for dark UIs, ensures global icon consistency.
  - **Action:** `pnpm add @tabler/icons-react`.
- **1.2: Animate.css Integration**
  - **What:** Add entrance animations to cards, page transitions, and Canon Take boxes.
  - **Why:** Enhances perceived value and creates a "premium" feel.
  - **Action:** Utilize `animate.css` classes (`fadeIn`, `slideInUp`).
- **1.3: Web Performance Optimization (WPO)**
  - **What:** Asset compression, lazy loading, and bundle analysis.
  - **Why:** Faster load times on GitHub Pages and lower data consumption.
  - **Action:** Implement `loading="lazy"` on posters and compress `assets/images/`.

---

## Phase 2: AI Upgrade (Differentiator)
> Expanding the unique "Canon Takes" feature set.

- **2.1: Multi-Source LLM Agents**
  - **What:** Add OpenRouter, Hugging Face, or Groq as fallbacks for Pollinations.AI.
  - **Why:** Increases reliability and speed of Canon Take generation.
- **2.2: AI-Generated Poster Fallbacks**
  - **What:** Generate themed AI art for titles with missing metadata/backgrounds.
  - **Why:** Eliminates blank placeholders in the UI.
- **2.3: Satisfaction Meter Integration**
  - **What:** Full wiring of AI-generated one-liners to movie scores.
  - **Why:** Adds "Gen Z" personality and engagement to every title.

---

## Phase 3: Backend & Security
> Hardening infrastructure for public traffic.

- **3.1: Rate Limiting**
  - **What:** Implement `express-rate-limit` on the proxy server.
  - **Why:** Prevents API cost spikes and prevents slamming the Gemini fallback.
- **3.2: Security Headers (Helmet.js)**
  - **What:** Basic HTTP hardening (CORS, CSP, XSS protection).
  - **Why:** Industry-standard security for any public-facing app.
- **3.3: Input Validation**
  - **What:** Sanitize all fields sent to `api-proxy.js`.
  - **Why:** Prevents injection attacks and ensures data integrity.

---

## Phase 4: SEO & Discoverability
> Making the application findable and shareable.

- **4.1: Meta Tags & Open Graph**
  - **What:** Add SEO titles, descriptions, and OG social preview tags.
  - **Why:** Professional previews when links are shared on social/chat apps.
- **4.2: Privacy-First Analytics**
  - **What:** Integrated Plausible or Umami analytics.
  - **Why:** Insight into user drops and popular features without tracking users.
- **4.3: Progressive Web App (PWA) Polish**
  - **What:** Custom install prompts, offline pages, and mobile shortcuts.
  - **Why:** Drives re-engagement on mobile devices.

---

## Phase 5: UI & Architecture
> Long-term maintenance and structural integrity.

- **5.1: ESM Refactor**
  - **What:** Gradually migrate CommonJS `require()` to ESM `import`.
  - **Why:** Better tree-shaking and modern industry alignment.
- **5.2: Component Performance Audit**
  - **What:** Memoization and render optimization for `Player.js` and `MetaPreview.js`.
  - **Why:** Ensures the heaviest components remains responsive on low-end devices.

---

## Immediate Build Order

| Order | Task | Effort |
|-------|------|--------|
| **1** | **OG Meta Tags** | Low |
| **2** | **Security Hardening (Helmet + Rate Limit)** | Low |
| **3** | **Tabler Icons Implementation** | Low |
| **4** | **Performance Audit** | Medium |
