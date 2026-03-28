# Hero Redesign + Satisfactory Meter Dial — Design Spec

**Date:** 2026-03-27
**Status:** Approved
**Agents:** Structure (hero/CSS/component), Soul (prompt/AI changes)

---

## Summary

Three interconnected changes to the Board hero section:

1. **Hero UX fixes** — remove progress bar, move nav arrows to bottom corners
2. **Canon Take redesign** — bigger text, shorter prompt (max 2 sentences), humor/tone-matched
3. **Satisfactory Meter Dial** — new SVG half-circle gauge sitting above Canon Take; aggregates IMDB + RT + Metacritic

---

## 1. Hero UX Fixes

### 1a. Remove the green progress bar

**Files:** `src/routes/Board/HeroShelf/HeroShelf.js`, `src/routes/Board/HeroShelf/styles.less`

> **Note:** The progress bar was added in commit `b2bdb29`. This spec intentionally supersedes that. The user has explicitly requested its removal — the dots already communicate position and the bar reads as a loading indicator.

Remove from `HeroShelf.js`:
```jsx
{validItems.length > 1 ? (
    <div className={styles['hero-progress-bar']}>
        <div key={currentIndex} className={styles['hero-progress-fill']} />
    </div>
) : null}
```

Remove from `styles.less`:
- `.hero-progress-bar` block
- `.hero-progress-fill` block
- `@keyframes hero-progress` block

### 1b. Move nav arrows to bottom corners

**File:** `src/routes/Board/HeroShelf/styles.less`

Replace the `.hero-nav` block with:

```less
.hero-nav {
    position: absolute;
    bottom: 1.5rem;           // was: top: 50%
    width: 2.75rem;           // was: 3.5rem
    height: 2.75rem;          // was: 3.5rem
    border-radius: 50%;
    background: rgba(13, 17, 23, 0.6);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 10;
    -webkit-backdrop-filter: blur(12px);
    backdrop-filter: blur(12px);
    transform: none;          // base: no transform

    &:hover {
        background: rgba(13, 17, 23, 0.9);
        border-color: rgba(255, 255, 255, 0.3);
        transform: scale(1.1); // hover: scale only, no translateY
    }

    &.hero-nav-prev { left: 3rem; }
    &.hero-nav-next { right: 3rem; }
}
```

The `.hero-shelf-container:hover .hero-nav { opacity: 1; }` rule stays unchanged.
Mobile: `.hero-nav { display: none; }` already in place — no change.

---

## 2. Canon Take Redesign

### 2a. Prompt rewrite

**File:** `src/common/pollinationsApi.js`

Replace the `CANON_TAKE_SYSTEM` constant with:

```js
const CANON_TAKE_SYSTEM = 'You write Canon Takes — 1 to 2 sentence honest movie verdicts for a Gen Z film platform called Caught in 4K. HARD RULE: maximum 2 sentences. Include at least one joke, cultural reference, or brutally honest line. Tone must match genre — horror: unsettled dread; romance: knowing smirk; action: pure hype; comedy: roast energy; drama: dry wit; thriller: nervous energy; tragedy: wry sadness. Examples: horror → "the kind of movie that made people sleep with the lights on for a week — and honestly, fair."; comedy → "if you didn\'t ugly-laugh at least once, we can\'t be friends."; drama → "oscar bait that actually earned it, which is rarer than you think." Draw from public reception vibe — low score = deserved shade, high score = earned hype. Never start with "This film" or "The movie". No spoilers. No em dashes. No AI tells like "delves into", "testament to", "nuanced". Write in lowercase where it fits the tone. Reply ONLY with the take text, nothing else.';
```

### 2b. Visual changes

**File:** `src/components/CanonTakeBox/styles.less`

Two changes only:

```less
// .canonTakeBox — tighten padding
.canonTakeBox {
    padding: 1.25rem 1.5rem;  // was: 1.5rem 1.75rem
    // all other rules unchanged
}

// .content — bigger, bolder text
.content {
    font-size: 1.2rem;   // was: 1rem
    font-weight: 600;    // was: 500
    // all other rules unchanged
}
```

---

## 3. Satisfactory Meter Dial

### 3a. New component

**New files:**
- `src/components/SatisfactionMeterDial/SatisfactionMeterDial.js`
- `src/components/SatisfactionMeterDial/styles.less`

**Export:** Add to `src/components/index.ts` in alphabetical order:
```ts
export { default as SatisfactionMeterDial } from './SatisfactionMeterDial/SatisfactionMeterDial';
```

### 3b. Data extraction in HeroShelf

**File:** `src/routes/Board/HeroShelf/HeroShelf.js`

Add this score-extraction block alongside the existing `imdbLink` extraction (after line 94):

```js
// IMDB: name is e.g. "7.8" — normalize to 0–100
const imdbScore = imdbLink?.name ? Math.round(parseFloat(imdbLink.name) * 10) : null;

// Rotten Tomatoes: require category contains 'tomatoes' (case-insensitive)
// name format is e.g. "97%" — parse integer
const rtLink = Array.isArray(item.links)
    ? item.links.find((l) => l.category?.toLowerCase().includes('tomatoes'))
    : null;
const rtScore = rtLink?.name ? parseInt(rtLink.name, 10) : null; // already 0–100

// Metacritic: require category contains 'metacritic' (case-insensitive)
// name format is e.g. "84" — already 0–100
const mcLink = Array.isArray(item.links)
    ? item.links.find((l) => l.category?.toLowerCase().includes('metacritic'))
    : null;
const mcScore = mcLink?.name ? parseInt(mcLink.name, 10) : null; // already 0–100

// Average — require at least 2 sources, otherwise null (dial hides itself)
const availableScores = [imdbScore, rtScore, mcScore].filter((s) => s !== null && !isNaN(s));
const avgScore = availableScores.length >= 2
    ? Math.round(availableScores.reduce((a, b) => a + b, 0) / availableScores.length)
    : null;
```

**If `avgScore` is null:** `SatisfactionMeterDial` receives `score={null}` and renders nothing (`return null`).

### 3c. Tier definitions

Define in `SatisfactionMeterDial.js`:

```js
const TIERS = [
    { min: 0,  max: 39,  name: 'Certified Flop', color: '#ff3b30' },
    { min: 40, max: 59,  name: 'Mid at Best',     color: '#ff9f0a' },
    { min: 60, max: 74,  name: 'Worth a Watch',   color: '#ffd60a' },
    { min: 75, max: 89,  name: 'Slaps Hard',      color: '#30d158' },
    { min: 90, max: 100, name: 'Absolute Cinema', color: '#00f0ff' },
];

function getTier(score) {
    return TIERS.find((t) => score >= t.min && score <= t.max) || TIERS[0];
}
```

### 3d. SVG dial specification

**SVG dimensions:** `viewBox="0 0 200 110"`, `width="100%"`, `max-width: 280px`

**Arc geometry:**
- Center: `cx=100, cy=100`
- Radius: `r=80`
- The arc goes from 180° (left) to 0° (right) — half circle, opening downward
- SVG arc path for a semicircle: `M 20 100 A 80 80 0 0 1 180 100`
- Total arc length at r=80 = π × 80 ≈ 251.3px

**Track (background arc):**
```jsx
<path
    d="M 20 100 A 80 80 0 0 1 180 100"
    fill="none"
    stroke="rgba(255,255,255,0.12)"
    strokeWidth="12"
    strokeLinecap="round"
/>
```

**Fill arc (score progress):**
- `stroke-dasharray`: total arc length = `251.3`
- `stroke-dashoffset`: `251.3 - (score / 100) * 251.3`
- Color: `tier.color`
- CSS transition on mount: animate `stroke-dashoffset` from `251.3` to final value over `800ms ease-out`
- On each new score (carousel rotation): re-trigger animation by key prop on the SVG element

**Needle:**
- Thin line from center `(100, 100)` pointing upward-left at 0 score, sweeping right
- Angle formula: `angle = 180 - (score / 100) * 180` degrees (0° = right = 100 score, 180° = left = 0 score)
- Convert to SVG: endpoint `x = 100 + 70 * cos(angleRad)`, `y = 100 - 70 * sin(angleRad)`
- Line: `x1=100 y1=100` to computed endpoint, stroke white, strokeWidth 2, strokeLinecap round
- Small circle at pivot: `cx=100 cy=100 r=4` fill white
- CSS transition on the line endpoint via React state with `transition: all 0.8s ease-out` (use a CSS class with computed inline style for the endpoint)

**Center text (SVG `<text>`):**
- Score: `x=100 y=88`, `font-size=32`, `font-weight=800`, `text-anchor=middle`, `fill=white`
- Tier name: `x=100 y=104`, `font-size=10`, `font-weight=700`, `text-anchor=middle`, `fill={tier.color}`, `text-transform=uppercase` (apply via CSS class, not SVG attribute)

**Source badges row (below SVG, in JSX not SVG):**
```jsx
<div className={styles.badges}>
    <span className={styles.badge}>⭐ {imdbRaw ?? '–'} IMDb</span>
    <span className={styles.badge}>🍅 {rtScore !== null ? `${rtScore}%` : '–'} RT</span>
    <span className={styles.badge}>Ⓜ {mcScore !== null ? mcScore : '–'} MC</span>
</div>
```

Each badge always renders (with `–` for missing values). No badges are hidden individually.

### 3e. Glass card CSS

**File:** `src/components/SatisfactionMeterDial/styles.less`

The container matches `CanonTakeBox` glass style exactly:

```less
.dialContainer {
    padding: 1.25rem 1.5rem;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.08);
    -webkit-backdrop-filter: blur(36px) saturate(180%);
    backdrop-filter: blur(36px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.24);
    box-shadow:
        0 18px 48px rgba(0, 0, 0, 0.35),
        inset 0 1px 0 rgba(255, 255, 255, 0.24),
        inset 0 -1px 0 rgba(0, 0, 0, 0.35);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
}

.badges {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
}

.badge {
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.25rem 0.65rem;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
    letter-spacing: 0.02em;
}
```

### 3f. HeroShelf wiring

**File:** `src/routes/Board/HeroShelf/HeroShelf.js`

1. Import: `const { default: SatisfactionMeterDial } = require('stremio/components/SatisfactionMeterDial');`

2. Replace the current `<div className={styles['hero-canon-take']}>` block with:

```jsx
<div className={styles['hero-meter-stack']}>
    <SatisfactionMeterDial
        score={avgScore}
        imdbRaw={imdbLink?.name ?? null}
        rtScore={rtScore}
        mcScore={mcScore}
    />
    <CanonTakeBox
        title={item.name}
        year={year}
        takeOverride={heroCanonTake}
    />
</div>
```

3. Add to `styles.less` (inside `.hero-content`):

```less
.hero-meter-stack {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 420px;
    width: 100%;
}
```

4. Mobile override (`max-width: 768px`) — inside `.hero-content`:

```less
.hero-meter-stack {
    // SatisfactionMeterDial inside will be hidden via its own mobile rule
    gap: 0.75rem;
}
```

Add to `SatisfactionMeterDial/styles.less`:

```less
@import (reference) '~stremio/common/screen-sizes.less';

@media only screen and (max-width: 768px) {
    .dialContainer {
        display: none;
    }
}
```

This hides only the dial on mobile; the Canon Take remains visible. No container gap/padding issue since `flex-direction: column; gap: 1rem` collapses naturally when the first child is `display: none`.

---

## 4. PLAN.md Updates

Add to ACTIVE BUGS section after existing bugs:

```markdown
### [F5] Hero UX Polish
**Severity:** Medium | **Status:** Open
**Files:** `src/routes/Board/HeroShelf/HeroShelf.js`, `src/routes/Board/HeroShelf/styles.less`
- Remove green progress bar (supersedes commit b2bdb29 — intentional)
- Move nav arrows from vertical center to bottom corners (bottom: 1.5rem)
**Agent:** Structure

### [F6] Canon Take Redesign
**Severity:** Medium | **Status:** Open
**Files:** `src/common/pollinationsApi.js`, `src/components/CanonTakeBox/styles.less`
- Rewrite CANON_TAKE_SYSTEM prompt: 2-sentence max, humor/tone-matched to genre
- Visual: font-size 1.2rem, font-weight 600, tighter padding
**Agent:** Soul (prompt), Structure (styles)

### [F7] Satisfactory Meter Dial
**Severity:** Medium | **Status:** Open
**Files:** `src/components/SatisfactionMeterDial/` (new), `src/routes/Board/HeroShelf/HeroShelf.js`, `src/routes/Board/HeroShelf/styles.less`, `src/components/index.ts`
- New SVG 180° dial component: IMDB + RT + Metacritic averaged (min 2 sources)
- 5 tiers: Certified Flop → Absolute Cinema
- Stacked above Canon Take in hero; hidden on mobile (≤768px)
**Agent:** Structure
```

---

## Implementation Order

1. **Structure** — F5: hero progress bar removal + arrow reposition (lowest risk)
2. **Soul** — F6a: `pollinationsApi.js` prompt rewrite (one constant, no UI risk)
3. **Structure** — F6b: `CanonTakeBox/styles.less` font + padding (2 lines)
4. **Structure** — F7: build `SatisfactionMeterDial` component + styles
5. **Structure** — F7: wire dial into HeroShelf (score extraction + JSX swap)
6. **Guardian** — verify: no layout breaks, dial renders with real data, Canon Take text is larger, arrows at bottom, no progress bar visible

---

## Files Touched

| File | Change |
|------|--------|
| `src/routes/Board/HeroShelf/HeroShelf.js` | Remove progress bar JSX, add score extraction, import + wire SatisfactionMeterDial |
| `src/routes/Board/HeroShelf/styles.less` | Remove progress bar CSS + keyframes, reposition arrows, add `.hero-meter-stack` |
| `src/components/CanonTakeBox/styles.less` | Font size 1.2rem, weight 600, padding 1.25rem 1.5rem |
| `src/common/pollinationsApi.js` | Replace `CANON_TAKE_SYSTEM` constant |
| `src/components/SatisfactionMeterDial/SatisfactionMeterDial.js` | New component |
| `src/components/SatisfactionMeterDial/styles.less` | New component styles |
| `src/components/index.ts` | Add named export (alphabetical order) |
| `docs/planning/PLAN.md` | Add F5, F6, F7 tasks |
