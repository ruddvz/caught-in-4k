# Common Utilities & Hooks

All exports available via `stremio/common` alias. Barrel file: `src/common/index.js` (74 lines).

## Constants & Config

| File | Lines | Purpose | Key Exports |
|------|-------|---------|-------------|
| `CONSTANTS.js` | 143 | App-wide constants | `CATALOG_PAGE_SIZE, IMDB_LINK_CATEGORY, GENRES, LANGUAGES, ...` |
| `routesRegexp.js` | 66 | Regex patterns for all routes | `{ intro, board, discover, library, search, metadetails, addons, settings, player, calendar, ... }` |
| `languages.ts` | 25 | Language code/name mapping | `LANGUAGES` |

## Core Data Hooks

| File | Lines | Purpose | Key Exports | Depends On |
|------|-------|---------|-------------|------------|
| `useModelState.js` | 76 | **Universal WASM bridge**. Dispatches Load/Unload to core, subscribes to model state. Used by every route. | `useModelState` | `useServices` |
| `CoreSuspender.js` | 79 | HOC + hook for WASM init suspense | `withCoreSuspender, useCoreSuspender` | `useServices` |
| `useProfile.js` | 22 | Current user profile from core | `useProfile` | `useModelState` |
| `useStreamingServer.js` | 9 | Streaming server status | `useStreamingServer` | `useModelState` |
| `useNotifications.js` | 11 | Notification state from core | `useNotifications` | `useModelState` |
| `useSettings.ts` | 27 | Read/write user settings via core | `useSettings` | `useServices` |

## UI Utility Hooks

| File | Lines | Purpose | Key Exports |
|------|-------|---------|-------------|
| `useBinaryState.js` | 19 | Boolean toggle: `[state, open, close, toggle]` | `useBinaryState` |
| `useFullscreen.ts` | 86 | Fullscreen API wrapper | `useFullscreen` |
| `useInViewport.js` | 37 | IntersectionObserver viewport detection | `useInViewport` |
| `useOnScrollToBottom.js` | 22 | Infinite scroll detection | `useOnScrollToBottom` |
| `useAnimationFrame.js` | 21 | requestAnimationFrame wrapper | `useAnimationFrame` |
| `useLiveRef.js` | 11 | Ref always pointing to latest value | `useLiveRef` |
| `useInterval.ts` | 26 | setInterval with auto-cleanup | `useInterval` |
| `useTimeout.ts` | 26 | setTimeout with auto-cleanup | `useTimeout` |
| `useOutsideClick.ts` | 27 | Click-outside detection | `useOutsideClick` |
| `useOrientation.ts` | 34 | Screen orientation via matchMedia | `useOrientation` |
| `usePWA.js` | 14 | PWA detection/install prompt | `usePWA` |
| `useShell.ts` | 105 | Native shell communication (Electron) | `useShell` |
| `useSatisfactionMeter.ts` | 30 | Satisfaction survey/feedback | `useSatisfactionMeter` |

## Translation

| File | Lines | Purpose | Key Exports |
|------|-------|---------|-------------|
| `useTranslate.js` | 62 | i18next wrapper with `t.string()`, `t.catalogTitle()` | `useTranslate` |
| `caught-in-4k-translations.js` | 28 | C4K-specific translation strings | `translations` |
| `useC4KTranslations.js` | 13 | C4K translation hook | `useC4KTranslations` |
| `useLanguageSorting.ts` | 38 | Language-aware sorting | `useLanguageSorting` |

## C4K Features

| File | Lines | Purpose | Key Exports |
|------|-------|---------|-------------|
| `useCanonTakes.ts` | 101 | Canon Takes state (fetch, cache, display) | `useCanonTakes` |
| `pollinationsApi.js` | 76 | Pollinations AI image generation | `generateImage` |

## Utility Functions

| File | Lines | Purpose | Key Exports |
|------|-------|---------|-------------|
| `comparatorWithPriorities.js` | 25 | Array sorting with priority lists | `comparatorWithPriorities` |
| `getVisibleChildrenRange.js` | 30 | DOM utility: visible children in scroll container | `getVisibleChildrenRange` |
| `useTorrent.js` | 50 | Torrent operations (parse magnet/files) | `useTorrent` |

## Context Providers (subdirectories)

| Directory | Purpose | Key Exports |
|-----------|---------|-------------|
| `FileDrop/` | Drag-and-drop file handling | `FileDrop` (provider), `onFileDrop`, `readFile`, `getFileType` |
| `Platform/` | Device/OS detection | `PlatformProvider, usePlatform`, `getDevice, isAndroid, isIOS, isMobile` |
| `Shortcuts/` | Keyboard shortcuts registration | `Shortcuts` (provider), `useShortcuts`, `onShortcut` |
| `Toast/` | Toast notification system | `ToastProvider, useToast, ToastItem` |
| `Tooltips/` | Tooltip system | `TooltipProvider, useTooltip, Tooltip, TooltipItem` |
