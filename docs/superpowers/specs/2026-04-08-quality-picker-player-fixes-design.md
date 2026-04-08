# Quality Picker & Player Fixes Design

**Date:** 2026-04-08
**Status:** Approved
**Scope:** MetaDetails stream selection overhaul, player reliability fixes, subscription page polish

---

## Problem Statement

1. **Stream list overwhelm**: When a user clicks on a movie/show, dozens to hundreds of add-on streams load. The list is unscrollable on mobile and unwieldy on desktop.
2. **Player freezing**: The player enters a play-pause loop due to a mousedown/click event conflict. Many streams buffer forever without recovery.
3. **Audio failures**: ~99% of streams play video but produce no audio, likely due to codec incompatibility with the browser's native decoder. No automatic recovery exists.
4. **Subscription page**: Currently shows placeholder/preview states that don't convey value.

## Solution Overview

Replace the stream list with **5 quality buttons** (4K, 2K, 1080p, 720p, Custom) that auto-select the best working stream. Fix the player's event conflicts and add auto-fallback when a stream fails.

---

## Part 1: Quality Picker (MetaDetails Right Panel)

### Layout (top to bottom)

1. IMDB rating + satisfaction meter (existing MetaPreview - unchanged)
2. **QualityPicker component** — 5 buttons: 4K, 2K, 1080p, 720p, Custom

### New Files

| File | Purpose |
|------|---------|
| `src/routes/MetaDetails/QualityPicker/QualityPicker.js` | Main component — renders 5 quality buttons |
| `src/routes/MetaDetails/QualityPicker/QualityButton.js` | Individual button with status indicator |
| `src/routes/MetaDetails/QualityPicker/useStreamPicker.js` | Hook: classifies, filters, pre-tests, and ranks streams |
| `src/routes/MetaDetails/QualityPicker/streamClassifier.js` | Pure functions: parse resolution and file size from description text |
| `src/routes/MetaDetails/QualityPicker/styles.less` | Styles |
| `src/routes/MetaDetails/QualityPicker/index.js` | Barrel export |

### Stream Classification (`streamClassifier.js`)

Parse resolution from stream `description` field using regex:
- `2160p` or `4K` or `UHD` -> tier: `4k`
- `1440p` or `2K` or `QHD` -> tier: `2k`
- `1080p` or `FHD` -> tier: `1080p`
- `720p` or `HD` (but not FHD/UHD) -> tier: `720p`

Parse file size from description:
- Match patterns like `15.2 GB`, `800 MB`, `1.5 GB`
- Convert to GB for comparison

### Size Limits

| Tier | Max Size |
|------|----------|
| 4K | 20 GB |
| 2K | 15 GB |
| 1080p | 8 GB |
| 720p | 1 GB |

Streams exceeding the size limit for their tier are excluded from that tier's candidates.

### `useStreamPicker` Hook

```
Input: metaDetails.streams (array from WASM core)
Output: {
  tiers: {
    '4k':    { status: 'available'|'loading'|'unavailable', candidates: [...], bestStream: stream|null },
    '2k':    { status: ..., candidates: [...], bestStream: ... },
    '1080p': { status: ..., candidates: [...], bestStream: ... },
    '720p':  { status: ..., candidates: [...], bestStream: ... },
  },
  allStreams: [...],  // unfiltered, for Custom view
  selectQuality: (tier) => deepLink,  // returns player URL for best stream
}
```

**Pre-testing strategy:**
- Once streams arrive (content.type === 'Ready'), send a lightweight `fetch` with `{ method: 'HEAD', signal: AbortSignal.timeout(5000) }` to each stream's external player URL
- Mark streams as `responsive` or `unresponsive`
- Rank within each tier: responsive streams first, then by file size ascending (smaller = faster load)
- Pre-testing runs in parallel with `Promise.allSettled`, capped at 5 concurrent requests

### Button States

- **Available** (accent color glow): at least one responsive candidate
- **Loading** (pulsing animation): streams still loading from add-ons or pre-tests in progress
- **Unavailable** (greyed out, disabled): no candidates in this tier

### Custom Button Behavior

- Click **Custom** -> the 5 buttons collapse, the full `StreamsList` (existing component, unchanged) expands in the same space
- A back/collapse button at the top returns to the button view
- This preserves power-user access to individual stream selection

### Integration with MetaDetails

In `MetaDetails.js`, replace the `<StreamsList>` render with `<QualityPicker>`:
- Pass `streams={metaDetails.streams}`, `video`, `type`, `metaId`, etc.
- QualityPicker internally renders StreamsList only when Custom mode is active

---

## Part 2: Player Fixes

### Fix 1 — Play-Pause Loop (mousedown/click conflict)

**Root cause:** `Player.js` line ~966 adds a `window.addEventListener('mousedown', onMouseDownHold)` that starts a 200ms long-press timer on ANY left click. This conflicts with `onVideoClick` which debounces play/pause at 200ms.

**Fix:** Change `onMouseDownHold` to check if the click target is within the video container element (`video.containerRef.current`). Only start the long-press speed-boost timer when clicking directly on the video, not on controls or menus.

```js
const onMouseDownHold = (e) => {
    if (e.button !== 0) return;
    if (!video.containerRef.current?.contains(e.target)) return; // NEW GUARD
    // ... rest of handler
};
```

### Fix 2 — Auto-Fallback Stream System

New component/hook: `useStreamFallback`

**Inputs:**
- `candidateStreams`: ordered array of stream objects for the selected quality tier
- `currentStreamIndex`: which stream is currently loaded

**Behavior:**
1. When a stream starts loading, start an **8-second timeout**
2. If `video.state.buffering` is still `true` and `video.state.time` is still `null` after 8s -> try next stream
3. If video starts playing (`time > 0`) but no audio tracks are detected (`video.state.audioTracks.length === 0`) after 3s of playback -> try next stream
4. If `video.events` emits `error` with `error.critical === true` -> try next stream immediately
5. If all candidates exhausted -> show error overlay with "Try another quality" button

**Stream loading:** When fallback triggers, construct the player URL for the next candidate and call `window.location.replace(newPlayerUrl)` (same pattern used by `handleNextVideoNavigation`).

**UX in BufferingLoader:** Display "Trying stream X of Y..." text so the user sees progress, not a frozen screen.

### Fix 3 — BufferingLoader Enhancement

Add a subtitle line below the C4K logo SVG:
- During initial load: "Loading..."
- During fallback: "Stream 2 of 5 — finding the best source..."
- Props: `attemptNumber`, `totalCandidates`

---

## Part 3: Subscription Page Polish (Secondary Priority)

The Subscribe page (`src/routes/Subscribe/Subscribe.js`) currently shows useful states (checkout success, pending, suspended, etc.) but the "Live Preview Mode" state when auth isn't configured looks like an error.

**Changes:**
- When `!authConfigured`: show a polished "Coming Soon" card with the C4K branding, plan previews with pricing, and a "Notify Me" placeholder button
- When `isSubscribed`: enhance the "Access is live" section with a visual countdown bar showing days remaining
- General: tighten spacing, ensure mobile responsiveness matches the rest of the app

This is cosmetic polish only — no backend changes.

---

## Files Modified (Summary)

| File | Change |
|------|--------|
| `src/routes/MetaDetails/MetaDetails.js` | Replace StreamsList with QualityPicker |
| `src/routes/MetaDetails/QualityPicker/*` | **NEW** — 6 new files |
| `src/routes/Player/Player.js` | Fix mousedown guard, integrate fallback |
| `src/routes/Player/BufferingLoader/BufferingLoader.js` | Add attempt counter text |
| `src/routes/Player/BufferingLoader/styles.less` | Style for attempt text |
| `src/routes/Player/useStreamFallback.js` | **NEW** — auto-fallback hook |
| `src/routes/Subscribe/Subscribe.js` | Polish UI states |
| `src/routes/Subscribe/styles.less` | Updated styles |

---

## Out of Scope

- Audio codec selection (surround, Dolby, 3D, language) — deferred to future work
- Streaming server / transcoding setup
- Backend subscription integration
- Stream quality preferences persistence
