# TypeScript Type Definitions

All type files in `src/types/`.

## Global & Utility Types

| File | Lines | Purpose | Key Types |
|------|-------|---------|-----------|
| `global.d.ts` | 29 | Global TS declarations: extends Window, module types for .less/.png/.svg, process.env | Window augmentation |
| `types.d.ts` | 77 | Shared utility types | `Profile, StreamingServer, StreamingServerSettings, UrlParams, CalendarDate, Calendar` |
| `Selectable.d.ts` | 27 | Filter/option types used across routes | `SelectableType, SelectableSort, SelectableCatalog, SelectablePage` |

## Domain Types

| File | Lines | Purpose | Key Types |
|------|-------|---------|-----------|
| `Addon.d.ts` | 20 | Addon manifest/descriptor | `Addon { name, version, types, catalogs, flags }` |
| `LibraryItem.d.ts` | 34 | Library item with state | `LibraryItem { state: { lastWatched, timeWatched, timeOffset, duration, flaggedWatched, ... }, deepLinks, progress, notifications }` |
| `MetaItem.d.ts` | 32 | Movie/series metadata | `MetaItem { name, type, poster, background, logo, description, releaseInfo, runtime, links, trailerStreams, deepLinks, videos, inLibrary }` |
| `Stream.d.ts` | 18 | Stream descriptor | `Stream { name, description, infoHash, url, ytId, behaviorHints, deepLinks }` |
| `Video.d.ts` | 22 | Video/episode | `Video { id, title, released, season, episode, thumbnail, overview, deepLinks }` |

## Model Types (WASM Core State Models)

| File | Lines | Purpose | Key Type |
|------|-------|---------|----------|
| `models/Ctx.d.ts` | 88 | **Most detailed**. User context/auth | `Ctx { profile: { auth, addons, settings: { subtitles, interface, player } } }` |
| `models/Board.d.ts` | 1 | Board model | `Board` (imports CatalogsWithExtra) |
| `models/CatalogsWithExtra.d.ts` | 11 | Catalogs model used by Board/Search | `CatalogsWithExtra { catalogs, selected }` |
| `models/Discover.d.ts` | 26 | Discover catalog model | `Discover { selected, catalog: { content: Ready|Loading|Err } }` |
| `models/Library.d.ts` | 29 | Library model | `Library { selected, selectable: { types, sorts, pages }, catalog }` |
| `models/MetaDetails.d.ts` | 28 | Meta details model | `MetaDetails { selected, metaItem, libraryItem, streams, metaExtensions, ratingInfo }` |
| `models/Player.d.ts` | 65 | Player model | `Player { selected, metaItem, libraryItem, title, nextVideo, seriesInfo, streamState }` |
| `models/Calendar.d.ts` | 55 | Calendar model | `Calendar { items, selected, monthInfo }` + `CalendarItem, CalendarMonthInfo, CalendarSelectable` |
| `models/InstalledAddons.d.ts` | 12 | Installed addons | `InstalledAddons` |
| `models/RemoteAddons.d.ts` | 10 | Remote addon catalog | `RemoteAddons` |
| `models/StremingServer.d.ts` | 130 | **Note typo in filename**. Streaming server | `StreamingServer { settings, statistics, baseUrl, remoteUrl, torrentProfile }` |
| `models/DataExport.d.ts` | 3 | Data export | `DataExport` |
| `models/LocalSearch.d.ts` | 10 | Local search | `LocalSearch` |
| `models/Search.d.ts` | 1 | Search model | `Search` (imports CatalogsWithExtra) |

## Type Usage Pattern

```typescript
// Route component loads model via useModelState
const [metaDetails] = useMetaDetails(urlParams);
// metaDetails is typed as MetaDetails from models/MetaDetails.d.ts
// metaDetails.metaItem?.content is typed as MetaItem from MetaItem.d.ts
// metaDetails.streams?.content items are typed as Stream from Stream.d.ts
```
