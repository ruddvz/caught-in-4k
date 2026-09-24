# C4K Stremio add-on foundation

Status: implemented foundation with generic index, Jellyfin and Plex providers

Branch: `feature/c4k-stremio-addon-foundation`

## Product boundary

C4K is a quality-first Stremio stream resolver. Stremio supplies a movie identifier, C4K asks one authorised source provider for the versions available to that installation, ranks those candidates, and returns the strongest options.

The first version supports IMDb-style movie IDs such as `tt1234567` and the Stremio `stream` resource for movies.

This implementation does not contain torrent discovery, cyberlocker scraping, DRM bypassing, credential sharing, or a built-in index of copyrighted media. Source access comes from an operator-authorised index, Jellyfin library, or Plex library.

## Deployment shape

The existing Caught in 4K frontend is static on GitHub Pages. A Stremio stream resolver and authenticated media relay require a server process, so the add-on runs independently.

Recommended production shape:

```text
c4k.live                 existing Caught in 4K web app
addon.c4k.live           persistent C4K add-on service

https://addon.c4k.live/manifest.json
https://addon.c4k.live/stream/movie/tt1234567.json
```

The add-on also exposes protocol routes below `/addon` for reverse-proxy deployments.

## Current endpoints

| Endpoint | Purpose |
|---|---|
| `GET /manifest.json` | Stremio manifest |
| `GET /stream/movie/:imdbId.json` | Ranked streams |
| `GET /addon/manifest.json` | Prefix-compatible manifest |
| `GET /addon/stream/movie/:imdbId.json` | Prefix-compatible stream endpoint |
| `GET/HEAD /media/jellyfin/:itemId/:mediaSourceId` | Signed Jellyfin relay |
| `GET/HEAD /media/plex/:partId` | Signed Plex media-Part relay |
| `GET /health` | Service health |

Start locally with:

```bash
pnpm addon:start
```

Focused checks:

```bash
pnpm lint:addon
pnpm test:addon
```

## Source providers

Select one provider with `C4K_SOURCE_PROVIDER`.

### `index`

Generic server-side provider contract. C4K requests already-normalised candidates from an authorised index and returns only URLs whose hostnames are explicitly allowlisted.

Required variables:

```dotenv
C4K_SOURCE_PROVIDER=index
C4K_SOURCE_INDEX_URL=https://index.example/api/candidates
C4K_ALLOWED_MEDIA_HOSTS=media.example.com,cdn.example.com
```

Optional bearer authentication remains server-side in `C4K_SOURCE_INDEX_TOKEN`.

### `jellyfin`

Built-in Jellyfin library provider. It:

1. Builds a cached IMDb-to-item index from the authorised movie library.
2. Fetches the full matched item so explicit C4K Tags are available.
3. Requests Jellyfin PlaybackInfo.
4. Converts each MediaSource into a normalised C4K candidate.
5. Returns a signed C4K relay URL rather than exposing `X-Emby-Token`.

Detailed design: [`C4K_JELLYFIN_PROVIDER.md`](./C4K_JELLYFIN_PROVIDER.md).

### `plex`

Built-in Plex Media Server provider. It:

1. Builds a cached IMDb-to-ratingKey index from Plex `Guid` values.
2. Fetches detailed matched metadata including `Media`, `Part`, `Stream` and `Label` data.
3. Converts each supported single-Part Media version into a C4K candidate.
4. Returns a signed C4K relay URL rather than exposing `X-Plex-Token`.
5. Rejects arbitrary Plex API paths and multi-Part movie versions in the current release.

Detailed design: [`C4K_PLEX_PROVIDER.md`](./C4K_PLEX_PROVIDER.md).

## Shared provider configuration

```dotenv
C4K_ADDON_PORT=7000
C4K_ADDON_PUBLIC_URL=https://addon.c4k.live
C4K_SOURCE_PROVIDER=jellyfin
C4K_QUALITY_PROFILE=absolute
C4K_MAX_STREAMS=5
C4K_MEDIA_RELAY_SECRET=replace-with-a-long-random-secret
C4K_MEDIA_RELAY_TTL_SECONDS=21600
```

Production personal-library deployments require HTTPS for C4K's public URL and the selected media server URL. Localhost HTTP is permitted outside production for development.

## Normalised candidate vocabulary

### Source provenance

- `uhd-bluray-remux`
- `uhd-bluray-encode`
- `bluray-remux`
- `web-dl`
- `bluray-encode`
- `web-rip`
- `direct-stream`
- `unknown`

Jellyfin and Plex default to `direct-stream`. They do not infer provenance from filenames, codecs or bitrate.

A library owner who has independently verified provenance may add explicit metadata:

```text
c4k:source=uhd-bluray-remux
```

Use a Jellyfin Tag or Plex Label.

### HDR

- `dolby-vision`
- `hdr10-plus`
- `hdr10`
- `hlg`
- `sdr`

Jellyfin maps its probed video-range fields. Plex maps current Plex technical stream display/profile metadata conservatively.

### Audio

- `truehd-atmos`
- `dts-x`
- `truehd`
- `dts-hd-ma`
- `eac3-atmos`
- `eac3`
- `dts`
- `ac3`
- `aac`

### IMAX/presentation

- `imax-1.90`
- `imax-1.43`
- `imax-variable`
- `imax-enhanced`

IMAX is never inferred from a filename. A verified library owner may add:

```text
c4k:presentation=imax-1.90
```

Use a Jellyfin Tag or Plex Label.

### 3D

- `mvc`
- `frame-packing`
- `full-sbs`
- `half-sbs`
- `top-bottom`
- `over-under`

Jellyfin currently supplies explicit 3D format mappings. Plex 3D mapping is not enabled until a sufficiently reliable current field is established.

## Ranking engine

`c4k-addon/quality.js` implements a deterministic scoring model. It prioritises source fidelity, then resolution and measured bitrate, with additional weight for HDR, high-fidelity audio, verified presentation metadata, bit depth and verified technical metadata.

The score is a C4K preference model. It is not presented as a scientific perceptual-quality measurement.

### `absolute`

General maximum-quality ranking. UHD Blu-ray Remux, 4K, measured bitrate, HDR and high-fidelity audio are weighted strongly when that metadata is actually available.

### `imax`

Uses the same base score and gives additional weight to explicit supported IMAX presentation metadata.

### `3d`

Uses the same base score and adds format-specific weight for MVC/frame-packed, then SBS/Top-Bottom variants.

## Public stream metadata

C4K returns useful Stremio descriptions without inventing missing properties. A result can include:

```text
2160p • UHD Blu-ray Remux
Dolby Vision • HDR10 • HEVC • 10-bit • 72 Mbps
IMAX 1.90:1 • TrueHD Atmos • 70 GB
C4K score 1030
```

Behaviour hints include filename and size when available, a profile/resolution binge group, and `notWebReady` when C4K cannot conservatively classify the container/codec as web-ready.

## Credential and relay security

1. Movie IDs must match the IMDb-style `tt` plus digits pattern.
2. Generic index URLs are server configuration, never client-supplied fetch targets.
3. Generic direct media hosts require an exact allowlist.
4. Jellyfin credentials stay server-side behind signed, expiring C4K URLs.
5. Plex credentials stay server-side behind signed, expiring C4K URLs.
6. Plex relay signatures bind the exact allowed `/library/parts/{partId}/...` path and reject traversal or arbitrary Plex API paths.
7. Media relays forward byte ranges and cancel upstream transfers when the client disconnects.
8. Provider lookup failures return no streams rather than fabricated fallbacks.
9. Add-on protocol routes use Helmet, CORS and request rate limiting.
10. Media relay routes are excluded from the request-count limiter because normal playback generates repeated range requests. Production still requires network-level abuse controls.
11. The manifest declares `p2p: false` because the implemented providers return authorised HTTP(S) streams.

## Tests and CI

`tests/c4kAddon.spec.js` covers the protocol, generic index boundary and quality engine.

`tests/c4kJellyfin.spec.js` covers Jellyfin IMDb matching, metadata mapping, explicit Tags and signed relay behaviour.

`tests/c4kPlex.spec.js` covers Plex IMDb Guid matching, Media/Part/Stream mapping, explicit Labels, multi-Part rejection and signed relay path security.

GitHub Actions runs:

```text
frontend lint
add-on lint
repository-wide Jest
translation scan
production frontend build
service-worker verification
Playwright E2E
visual regression capture
```

## Deployment considerations

The personal-library relays protect long-lived media-server credentials, but media bytes then flow through C4K. A production host must therefore support long-lived responses, HTTP ranges and sustained bandwidth. Reverse proxies must not buffer an entire movie response.

A persistent Node service close to the Jellyfin or Plex server is preferable to serverless platforms with strict response-size or execution-duration limits.

## Current deliberate limits

- Movies only. Series and episode identity are not guessed from titles.
- One provider is selected per deployment.
- Plex multi-Part Media entries are skipped.
- Plex transcoding/playback-decision integration is not yet implemented. The current path targets direct-playable authorised media.
- No per-user `/configure` flow yet.
- No persistent encrypted credential store yet.
- No device-specific compatibility profile yet.
- No distributed cache or relay bandwidth metrics yet.

## Next engineering slices

1. Run Jellyfin and Plex against real authorised servers and capture compatibility failures rather than guessing them.
2. Deploy the Node add-on behind `addon.c4k.live` on a persistent host.
3. Add encrypted per-user provider configuration without putting credentials into public manifest URLs.
4. Add device-aware compatibility rules separately from absolute-quality ranking.
5. Add series/episode support after movie identity and playback are stable.
