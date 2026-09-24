# C4K Stremio add-on foundation

Status: foundation implementation

Branch: `feature/c4k-stremio-addon-foundation`

## Product boundary

C4K is a quality-first resolver. Stremio supplies a movie identifier, C4K asks an authorised source index for the versions available to that installation, ranks those candidates, and returns only the strongest options.

The add-on does not need to duplicate Stremio metadata or maintain a second movie catalogue. The first version supports IMDb-style movie IDs such as `tt1234567` and the Stremio `stream` resource only.

This foundation intentionally does not contain torrent discovery, cyberlocker scraping, DRM bypassing, credential sharing, or a built-in index of copyrighted media. Source access is supplied separately by an authorised library/provider.

## Why this is a separate service

The existing Caught in 4K frontend is deployed as a static GitHub Pages application. A dynamic Stremio stream resource needs a server process. The add-on therefore lives in `c4k-addon/` and can be deployed independently without disturbing the current frontend.

Recommended production shape:

```text
c4k.live                 existing Caught in 4K web app
addon.c4k.live           C4K Stremio add-on service

https://addon.c4k.live/manifest.json
https://addon.c4k.live/stream/movie/tt1234567.json
```

The server also exposes the same protocol below `/addon` if a reverse proxy later mounts it on the main domain:

```text
https://c4k.live/addon/manifest.json
https://c4k.live/addon/stream/movie/tt1234567.json
```

## Current endpoints

| Endpoint | Purpose |
|---|---|
| `GET /manifest.json` | Stremio manifest |
| `GET /stream/movie/:imdbId.json` | Ranked streams |
| `GET /addon/manifest.json` | Prefix-compatible manifest |
| `GET /addon/stream/movie/:imdbId.json` | Prefix-compatible stream endpoint |
| `GET /health` | Service health |

The service can be started locally with:

```bash
node c4k-addon/server.js
```

Default port: `7000`.

## Environment

| Variable | Required | Purpose |
|---|---:|---|
| `C4K_SOURCE_INDEX_URL` | Yes for streams | Server-side endpoint that returns candidates for a movie ID |
| `C4K_ALLOWED_MEDIA_HOSTS` | Yes for streams | Comma-separated exact hostnames allowed to appear in returned direct media URLs |
| `C4K_SOURCE_INDEX_TOKEN` | No | Optional bearer token sent only to the source index |
| `C4K_SOURCE_TIMEOUT_MS` | No | Source-index timeout, default 8000 ms |
| `C4K_QUALITY_PROFILE` | No | `absolute`, `imax`, or `3d`; default `absolute` |
| `C4K_MAX_STREAMS` | No | Number of ranked streams returned, default 5, hard maximum 10 |
| `C4K_ADDON_PORT` | No | HTTP port, default 7000 |

The source boundary defaults closed. If either `C4K_SOURCE_INDEX_URL` or `C4K_ALLOWED_MEDIA_HOSTS` is absent, C4K returns an empty `streams` array.

In production, media URLs must use HTTPS. Localhost HTTP is accepted only outside production for development.

## Source-index contract

C4K calls the configured index with:

```text
GET {C4K_SOURCE_INDEX_URL}?type=movie&id=tt1234567
Accept: application/json
Authorization: Bearer {C4K_SOURCE_INDEX_TOKEN}   # only when configured
```

Accepted response forms:

```json
{
  "candidates": []
}
```

or:

```json
{
  "streams": []
}
```

or a JSON array directly.

Each candidate can contain:

```json
{
  "url": "https://media.example.com/library/movie.mkv",
  "filename": "movie.mkv",
  "source": "uhd-bluray-remux",
  "resolution": 2160,
  "videoCodec": "hevc",
  "bitDepth": 10,
  "hdr": ["dolby-vision", "hdr10"],
  "presentation": ["imax-1.90"],
  "audio": ["truehd-atmos"],
  "threeD": null,
  "bitrateMbps": 72,
  "sizeBytes": 75161927680,
  "verified": true,
  "webReady": false
}
```

C4K only forwards candidates whose `url` hostname is explicitly present in `C4K_ALLOWED_MEDIA_HOSTS`.

## Normalised quality vocabulary

### Source

- `uhd-bluray-remux`
- `uhd-bluray-encode`
- `bluray-remux`
- `web-dl`
- `bluray-encode`
- `web-rip`
- `direct-stream`
- `unknown`

### HDR

- `dolby-vision`
- `hdr10-plus`
- `hdr10`
- `hlg`
- `sdr`

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

These labels are intentionally explicit. An index should not emit `IMAX` merely because a filename contains that text. The provider is responsible for supplying presentation metadata it can substantiate.

### 3D

- `mvc`
- `frame-packing`
- `full-sbs`
- `half-sbs`
- `top-bottom`
- `over-under`

3D is modelled independently from resolution. The `3d` profile can therefore prefer a high-fidelity MVC/frame-packed presentation without pretending it is native 4K.

## Ranking engine

`c4k-addon/quality.js` uses a deterministic score. The order of importance is intentionally weighted toward source fidelity first, then resolution and measured bitrate, then HDR, audio, presentation and verified metadata.

This score is a C4K preference model, not a scientific measurement of perceptual quality. It exists so ranking is consistent, inspectable and testable rather than dependent on filename order.

### Profiles

`absolute`

- General maximum-quality ranking.
- UHD Blu-ray Remux is strongly preferred when other metadata is comparable.
- 4K resolution, high measured bitrate, HDR and lossless/high-fidelity audio contribute additional weight.

`imax`

- Uses the same base ranking.
- Adds a larger bonus to substantiated IMAX presentation metadata.

`3d`

- Uses the same base ranking.
- Adds format-specific weight for MVC/frame-packed and then SBS/Top-Bottom variants.

## Stremio stream output

A ranked candidate becomes a direct Stremio stream object similar to:

```json
{
  "name": "C4K • 2160p",
  "description": "2160p • UHD Blu-ray Remux\nDolby Vision • HDR10 • HEVC • 10-bit • 72 Mbps\nIMAX 1.90:1 • TrueHD Atmos • 70 GB\nC4K score 1030",
  "url": "https://media.example.com/library/movie.mkv",
  "behaviorHints": {
    "bingeGroup": "c4k-absolute-2160p",
    "filename": "movie.mkv",
    "videoSize": 75161927680,
    "notWebReady": true
  }
}
```

The actual score depends on the supplied metadata. Missing fields are omitted from the description rather than guessed.

## Security decisions in the foundation

1. The service accepts movie IDs only when they match an IMDb-style `tt` plus digits pattern.
2. The source-index URL is server configuration, not a request parameter. This avoids turning C4K into an arbitrary URL fetcher.
3. Direct stream hostnames must be explicitly allowlisted.
4. Production direct streams must use HTTPS.
5. A bearer token for the source index remains server-side.
6. Stream lookups fail closed. A provider error returns an empty stream list rather than fabricated fallback data.
7. Rate limiting, Helmet and CORS are applied by the standalone Express service.
8. The manifest declares `p2p: false` because this foundation returns authorised direct HTTP(S) streams only.

## Tests

`tests/c4kAddon.spec.js` covers:

- UHD Blu-ray Remux versus WEB-DL ordering
- IMAX profile weighting
- 3D profile weighting
- description generation without invented metadata
- Stremio behaviour hints
- exact media-host allowlisting
- rejection of HTTP and magnet URLs in production-style validation
- dropping unapproved provider candidates
- fail-closed behaviour when source configuration is absent
- IMDb movie ID validation
- maximum-stream selection

The existing repository Jest command should discover this test automatically:

```bash
pnpm test -- c4kAddon.spec.js
```

## Next engineering slices

### 1. Deployment

Deploy `c4k-addon/server.js` on a Node-capable service and map `addon.c4k.live` to it. GitHub Pages remains responsible only for the frontend.

### 2. Real authorised library adapter

Implement the first actual source-index provider. Good candidates are a user-owned Jellyfin/Plex bridge or a C4K-managed index containing only media C4K is authorised to serve. Keep the Stremio endpoint isolated from library credentials.

### 3. Media inspection

Instead of trusting filenames, populate candidate metadata from actual media inspection where the deployment architecture permits it. Store normalized facts such as resolution, codec, bit depth, HDR format, bitrate, audio format, runtime and presentation information.

### 4. Configuration

Add a proper `/configure` flow only after the authentication model for user-owned libraries is defined. Do not put Plex/Jellyfin tokens or equivalent long-lived secrets into a public manifest URL.

### 5. Compatibility policy

Add device-aware filters later. Maximum source quality and maximum playback compatibility are separate concerns. For example, a file that is objectively the strongest master may still require transcoding or may not be directly playable on a particular Stremio client.

### 6. Series

Keep the first release movie-only. Once the movie path is stable, add Stremio series/video ID parsing and episode-specific source lookups rather than guessing episode identity from titles.
