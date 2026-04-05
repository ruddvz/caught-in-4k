# Route Components

All route components are in `src/routes/`. Barrel: `src/routes/index.js` (33 lines).
Every route is wrapped with `withCoreSuspender` HOC (waits for WASM core init).

## Route → URL Mapping

| Route | URL Pattern | Component File |
|-------|-------------|----------------|
| Board (Home) | `#/` | `Board/Board.js` |
| Discover | `#/discover/:type?/:catalogId?/:extra?` | `Discover/Discover.js` |
| Library | `#/library/:type?` | `Library/Library.js` |
| Search | `#/search?query=` | `Search/Search.js` |
| MetaDetails | `#/metadetails/:type/:id/:videoId?` | `MetaDetails/MetaDetails.js` |
| Player | `#/player/:stream/:streamTransportUrl/...` | `Player/Player.js` |
| Settings | `#/settings` | `Settings/Settings.tsx` |
| Addons | `#/addons/:type?/:catalogId?/:extra?` | `Addons/Addons.js` |
| Calendar | `#/calendar/:year?/:month?/:day?` | `Calendar/Calendar.tsx` |
| Intro | `#/intro` | `Intro/Intro.js` |
| AuthPreview | `#/auth-preview` | `AuthPreview/AuthPreview.tsx` |
| ShadersHeroPreview | `#/shaders-hero-preview` | `ShadersHeroPreview/ShadersHeroPreview.tsx` |
| Profiles | `#/profiles` | `Profiles/Profiles.js` |

---

## Board (Home Page) — `src/routes/Board/`

| File | Lines | Purpose |
|------|-------|---------|
| `Board.js` | 164 | Hero shelf, continue watching row, catalog rows with scroll-based lazy loading |
| `useBoard.js` | 29 | Loads `CatalogsWithExtra` model → `[board, loadRange]` |
| `useContinueWatchingPreview.js` | 9 | Loads `continue_watching_preview` model |
| `HeroShelf/HeroShelf.js` | 206 | Auto-rotating hero carousel with background images, Canon Take, watch/trailer buttons |
| `StreamingServerWarning/StreamingServerWarning.tsx` | 101 | Warning banner when streaming server unreachable |
| `CategoryBar.js` | 36 | Horizontal category filter bar |

**Key imports**: `ContinueWatchingItem, MetaItem, MetaRow, EventModal, MainNavBars, CanonTakesQueue`

---

## Discover (Catalog Browser) — `src/routes/Discover/`

| File | Lines | Purpose |
|------|-------|---------|
| `Discover.js` | 247 | Filter dropdowns, infinite scroll grid, MetaPreview sidebar, addon install prompt |
| `useDiscover.js` | 75 | Loads `CatalogWithFilters` model → `[discover, loadNextPage]` |
| `useSelectableInputs.js` | 81 | Transforms discover state into filter dropdown options |

**Key imports**: `MetaItem, MetaPreview, MultiselectMenu, AddonDetailsModal, MainNavBars`

---

## Library — `src/routes/Library/`

| File | Lines | Purpose |
|------|-------|---------|
| `Library.js` | 135 | Type filter chips, sort chips, infinite scroll grid |
| `useLibrary.js` | 33 | Loads `LibraryWithFilters` model → `[library, loadNextPage]` |
| `useSelectableInputs.js` | 42 | Transforms library state into filter/sort options |
| `Placeholder/Placeholder.tsx` | 47 | Empty/loading state placeholder |

**Key imports**: `LibItem, Chips, MainNavBars`

---

## MetaDetails — `src/routes/MetaDetails/`

| File | Lines | Purpose |
|------|-------|---------|
| `MetaDetails.js` | 245 | MetaPreview + VideosList (episodes) + StreamsList (streaming sources) + extension iframes |
| `useMetaDetails.js` | 73 | Loads `MetaDetails` model with meta/stream paths |
| `useSeason.js` | 24 | Season selection from URL query params |
| `useMetaExtensionTabs.js` | 23 | Meta extensions → vertical nav tabs |
| `StreamsList/StreamsList.js` | 221 | Stream list with search/filter, addon grouping |
| `StreamsList/Stream/Stream.js` | 287 | Individual stream: provider, quality badges, deep link, share |
| `VideosList/VideosList.js` | 206 | Episode list with season bar, watched state, mark-as-watched |
| `VideosList/SeasonsBar/SeasonsBar.js` | 88 | Season selector with notification toggles |
| `EpisodePicker/EpisodePicker.tsx` | 74 | Season/episode number input |

**Key imports**: `MetaPreview, Video, VerticalNavBar, HorizontalNavBar, MultiselectMenu`

---

## Player — `src/routes/Player/`

**Largest route** (~1,069 lines in Player.js alone).

| File | Lines | Purpose |
|------|-------|---------|
| `Player.js` | 1,069 | Full player: video, controls, menus, side drawer, next-video popup, buffering, shortcuts, chromecast |
| `usePlayer.js` | 177 | Loads `Player` model; dispatch wrappers for all player actions |
| `useVideo.js` | 244 | Wraps `@stremio/stremio-video`; manages video element lifecycle |
| `useStatistics.js` | 84 | Player statistics (bitrate, codec, peers, speed) |
| `ControlBar/ControlBar.js` | 222 | Play/pause, seek bar, volume, time, fullscreen, menu toggles |
| `ControlBar/SeekBar/SeekBar.js` | 81 | Seek bar with time preview and buffer progress |
| `ControlBar/VolumeSlider/VolumeSlider.js` | 74 | Volume slider with mute toggle |
| `SubtitlesMenu/SubtitlesMenu.js` | 278 | Subtitle selection + size/offset/delay/colors |
| `AudioMenu/AudioMenu.tsx` | 67 | Audio track selection |
| `SpeedMenu/SpeedMenu.js` | 50 | Playback speed selection |
| `StatisticsMenu/StatisticsMenu.js` | 62 | Real-time stream statistics display |
| `OptionsMenu/OptionsMenu.js` | 143 | General player options |
| `NextVideoPopup/NextVideoPopup.js` | 107 | Auto-play next video countdown |
| `BufferingLoader/BufferingLoader.js` | 27 | Loading spinner during buffering |
| `VolumeChangeIndicator/VolumeChangeIndicator.js` | 63 | On-screen volume OSD |
| `Video/Video.js` | 24 | Video element container |
| `Error/Error.js` | 56 | Error overlay with retry |
| `SideDrawer/SideDrawer.tsx` | 143 | Episode list side panel |
| `SideDrawerButton/SideDrawerButton.tsx` | 21 | Side drawer toggle |
| `Indicator/Indicator.tsx` | 74 | Seek/play/pause OSD |
| `VideosMenu/VideosMenu.js` | 67 | Episode list during playback |

---

## Settings — `src/routes/Settings/`

| File | Lines | Purpose |
|------|-------|---------|
| `Settings.tsx` | 50 | 2-column dashboard: left (General + Interface), right (Player widget) |
| `constants.ts` | 10 | Seek time options, etc. |
| **General/** | | |
| `General/General.tsx` | 117 | Account widget: avatar, email, logout, Trakt, data export |
| `General/User/User.tsx` | 66 | User profile display |
| `General/useDataExport.js` | 32 | Data export URL from core |
| **Interface/** | | |
| `Interface/Interface.tsx` | 47 | Blur unwatched, quit on close, esc fullscreen toggles |
| `Interface/useInterfaceOptions.ts` | 62 | Interface toggle state/handlers |
| **Player/** | | |
| `Player/Player.tsx` | 97 | Subtitles, audio, seek, auto-play, external player — 3-column grid |
| `Player/usePlayerOptions.ts` | 375 | **Largest settings hook**: builds all player option data |
| **Streaming/** (parked) | | |
| `Streaming/Streaming.tsx` | 92 | Server URLs, cache, torrent/transcoding profiles |
| `Streaming/useStreamingOptions.ts` | 237 | Streaming server option data |
| `Streaming/URLsManager/` | ~278 | URL CRUD with add/remove |
| **Shortcuts/** (parked) | | |
| `Shortcuts/Shortcuts.tsx` | 49 | Keyboard shortcuts grid |
| **Info/** (not rendered) | | |
| `Info/Info.tsx` | 52 | App/build/server version info |
| **Shared components** | | |
| `components/Section.tsx` | 26 | Section wrapper with label |
| `components/Option.tsx` | 36 | Option row: icon + label + content |
| `components/Category.tsx` | 26 | Option group with icon/label |
| `components/Link.tsx` | 20 | Clickable link |

---

## Addons — `src/routes/Addons/`

| File | Lines | Purpose |
|------|-------|---------|
| `Addons.js` | 321 | Installed/remote lists, search, install/uninstall/configure/share, add-by-URL |
| `useInstalledAddons.js` | 29 | Loads `InstalledAddons` model |
| `useRemoteAddons.js` | 35 | Loads `RemoteAddons` model |
| `useSelectableInputs.js` | 70 | Filter inputs for addon type/catalog |
| `useAddonDetailsTransportUrl.js` | 22 | Addon URL from query params |
| `Addon/Addon.js` | 168 | Addon card: logo, name, description, types, actions |
| `AddonPlaceholder/AddonPlaceholder.tsx` | 34 | Loading skeleton |

---

## Calendar — `src/routes/Calendar/`

| File | Lines | Purpose |
|------|-------|---------|
| `Calendar.tsx` | 75 | Month selector + calendar table + date list + details bottom sheet |
| `useCalendar.ts` | 27 | Loads `Calendar` model |
| `useCalendarDate.ts` | 50 | Date formatting utilities |
| `Selector/Selector.tsx` | 61 | Month/year prev/next navigation |
| `Table/Table.tsx` | 62 | Calendar grid |
| `Table/Cell/Cell.tsx` | 65 | Day cell |
| `List/List.tsx` | 41 | Episode list for selected month |
| `List/Item/Item.tsx` | 67 | Episode item |
| `Details/Details.tsx` | 47 | Selected date details panel |
| `Placeholder/Placeholder.tsx` | 47 | Unauthenticated state placeholder |

---

## Other Routes

| Route | File | Lines | Purpose |
|-------|------|-------|---------|
| Intro | `Intro/Intro.js` | 427 | Login/signup: email, Facebook, Apple, guest, password reset |
| AuthPreview | `AuthPreview/AuthPreview.tsx` | 7 | Isolated route that renders the shadcn auth showcase from `src/components/ui/demo.tsx` |
| ShadersHeroPreview | `ShadersHeroPreview/ShadersHeroPreview.tsx` | 7 | Isolated route that renders the shader hero showcase from `src/components/ui/shaders-hero-demo.tsx` |
| Profiles | `Profiles/Profiles.js` | 295 | C4K "Who's watching?" Netflix-like profile selector |
| NotFound | `NotFound/NotFound.js` | 31 | 404 page |
| Tos | `Tos/Tos.js` | 126 | Terms of Service (Gen Z tone) |
| PrivacyPolicy | `PrivacyPolicy/PrivacyPolicy.js` | 165 | Privacy Policy |
| SettingsShortcuts | `SettingsShortcuts/SettingsShortcuts.tsx` | 41 | Standalone keyboard shortcuts page |
