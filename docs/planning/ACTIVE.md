# Active Bugs
Last updated: 2026-03-27
Source: Synced from Obsidian `C4K-Brain/ACTIVE.md`

All confirmed, not yet fixed. Structured by session.

---

## SESSION 2 — MOBILE NAVIGATION (REMAINING)

### [BUG-S2.3] Top Bar Missing on Detail Page Mobile
**Severity:** Major | **Status:** Open
**Files:** `src/routes/MetaDetails/MetaDetails.js`, `src/components/MainNavBars/MainNavBars.tsx`
**Fix:** `position: sticky; top: 0; z-index: 100` on top bar.

---

## RESOLVED (this session)

- S1.1a Settings cannot scroll — **FIXED** (overflow-y: auto)
- S1.1b Settings dropdowns don't open — **VERIFIED FIXED** (z-index: 9999 already in place)
- S1.2 Detail page summary/genres/cast hidden — **VERIFIED FIXED** (height: auto; overflow: visible already in place)
- S1.3 Detail card collapses (mobile) — **FIXED** (flex-shrink: 0 on hero-widget)
- S1.4 Canon Take stuck in skeleton — **VERIFIED FIXED** (timeout fallback already implemented)
- S2.1a Mobile bottom nav not rendering — **VERIFIED FIXED** (always mounted in MainNavBars.tsx)
- S2.1b Breakpoint gap at 768px — **VERIFIED FIXED** (breakpoints aligned)
- S2.2 Bottom nav active tab circle → pill — **VERIFIED FIXED** (border-radius: 9999px already in place)
- S2.4 Hero empty space below buttons — **FIXED** (margin-bottom: 16px on .hero-actions)
- S2.5a TRAILER button plays wrong movie — **VERIFIED FIXED** (trailerHref reactive from item)
- S2.5b No swipe gesture on hero — **VERIFIED FIXED** (touch handlers already implemented)
- S3.1a Board page ends abruptly — **VERIFIED FIXED** (overflow-y: auto + proper padding)
- S3.1b Empty gap after hero — **VERIFIED FIXED** (margins already correct)
- S3.2a Genre dropdown overlaps grid — **VERIFIED FIXED** (z-index already in place)
- S3.2b Titles truncated to one line — **VERIFIED FIXED** (-webkit-line-clamp: 2 already in place)
- S3.3 Detail right panel dead space — **VERIFIED FIXED** (height: auto already in place)
- S4.1 viewport-fit=cover missing — **VERIFIED FIXED** (already in webpack config)
- S4.2 Content hides behind bottom nav — **FIXED** (padding-bottom added to Board; MainNavBars already handles others)
- S4.3 Add to Library no feedback — **VERIFIED FIXED** (auth redirect already in MetaPreview.js)
