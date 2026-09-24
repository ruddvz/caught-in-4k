# C4K Plex provider

Status: implemented on `feature/c4k-stremio-addon-foundation`

## Purpose

The Plex provider lets C4K resolve Stremio movie requests against a Plex Media Server that the operator is authorised to access. It follows the same provider boundary and quality-ranking pipeline as Jellyfin.

The flow is:

```text
Stremio IMDb movie id
    -> C4K stream endpoint
    -> Plex movie IMDb Guid index
    -> full Plex metadata for the match
    -> Plex Media / Part / Stream metadata
    -> one C4K candidate per supported Media version
    -> C4K quality ranking
    -> signed C4K Plex relay URL
    -> exact Plex media Part with X-Plex-Token kept server-side
```

## Authentication boundary

Plex authentication is sent from C4K to Plex with `X-Plex-Token`. C4K also supplies a stable `X-Plex-Client-Identifier` and product name.

The Plex token is never returned to Stremio and is never added to the public media URL.

Public stream URLs look like:

```text
https://addon.c4k.live/media/plex/{partId}?key=...&expires=...&signature=...
```

The `key` value is a base64url representation of the Plex `Part.key`. It is not a credential. The HMAC signature covers the part id, exact part key and expiry timestamp.

## Relay path restriction

C4K does not act as a generic authenticated Plex proxy.

A signed relay is accepted only when the decoded Plex path has the official media-part shape:

```text
/library/parts/{partId}/...
```

The route rejects:

- non-numeric part ids
- part keys whose embedded id does not match the route part id
- arbitrary `/library/metadata/...` or other Plex API paths
- path traversal using `..`
- keys containing their own query string or fragment

After validation, C4K requests that exact media Part with `X-Plex-Token` in the upstream request header.

## Range requests

The Plex relay supports long direct-play transfers and byte seeking using the same relay behaviour as Jellyfin.

Forwarded client request headers include:

- `Range`
- `If-Range`
- `If-None-Match`
- `If-Modified-Since`

Forwarded Plex response headers include:

- `Accept-Ranges`
- `Cache-Control`
- `Content-Length`
- `Content-Range`
- `Content-Type`
- `ETag`
- `Last-Modified`

If the Stremio client disconnects, the C4K relay aborts the upstream Plex fetch.

## IMDb library index

C4K pages through Plex's movie library and requests IMDb-capable `Guid` metadata.

The request is based on:

```text
GET /library/all?type=1&includeFields=ratingKey,key,guid,title,type&includeElements=Guid
X-Plex-Container-Start: ...
X-Plex-Container-Size: ...
Accept: application/json
```

IMDb ids are read from Guid values shaped like:

```text
imdb://tt1234567
```

C4K caches a map from lowercase IMDb id to Plex `ratingKey` for five minutes by default.

Relevant controls:

```text
C4K_PLEX_CACHE_MS
C4K_PLEX_PAGE_SIZE
C4K_PLEX_SCAN_MAX_ITEMS
C4K_PLEX_TIMEOUT_MS
```

## Detailed movie metadata

After an IMDb match, C4K requests:

```text
GET /library/metadata/{ratingKey}?includeElements=Guid,Media,Label
```

The resulting hierarchy provides the information C4K needs:

```text
Metadata
  -> Media
      -> Part
          -> Stream
```

C4K maps technical properties from Plex metadata rather than trying to derive them from filenames.

Current mappings include:

- width and height
- video resolution
- video codec
- video bit depth
- bitrate
- Part file size
- HDR/Dolby Vision indicators from Plex technical stream display metadata
- audio codec/profile and Atmos/DTS:X indicators

## Multiple Plex Media versions

A Plex movie can expose more than one `Media` entry. C4K treats each supported Media entry as a separate candidate and lets the shared quality engine rank them.

A Media entry is currently supported only when it has exactly one `Part`.

If a Media entry contains multiple Parts, C4K skips it. Returning only one Part would create incomplete playback. Multi-part support should be implemented only with an explicit playback/concatenation design.

## Source provenance and IMAX

Technical Plex metadata cannot prove that a file is specifically a UHD Blu-ray Remux, WEB-DL or an IMAX presentation. C4K therefore does not assign those labels from filenames or bitrate patterns.

If the library owner has independently verified those facts, add Plex Labels:

```text
c4k:source=uhd-bluray-remux
c4k:presentation=imax-1.90
```

Accepted source values:

```text
uhd-bluray-remux
uhd-bluray-encode
bluray-remux
web-dl
bluray-encode
web-rip
direct-stream
unknown
```

Accepted presentation values:

```text
imax-1.90
imax-1.43
imax-variable
imax-enhanced
```

Plain labels such as `IMAX` or `Remux` are ignored. Only the explicit C4K vocabulary affects provenance/presentation ranking.

Without an explicit source label, the media version is classified as `direct-stream`.

## Required environment

Minimum:

```dotenv
C4K_SOURCE_PROVIDER=plex
C4K_PLEX_URL=https://plex.example.com
C4K_PLEX_TOKEN=...
C4K_ADDON_PUBLIC_URL=https://addon.c4k.live
C4K_MEDIA_RELAY_SECRET=...
```

Optional:

```dotenv
C4K_PLEX_CLIENT_ID=c4k-stremio-addon
C4K_PLEX_CACHE_MS=300000
C4K_PLEX_PAGE_SIZE=200
C4K_PLEX_SCAN_MAX_ITEMS=20000
C4K_PLEX_TIMEOUT_MS=8000
C4K_MEDIA_RELAY_TTL_SECONDS=21600
```

Production requires HTTPS for both the C4K public URL and Plex base URL. Localhost HTTP is accepted outside production for local development.

## Deployment consequence

As with Jellyfin, the signed relay protects credentials by putting C4K in the media path.

That means:

- C4K consumes the media bandwidth
- the hosting platform must support long-lived responses
- byte ranges must pass through correctly
- reverse proxies must not buffer entire movie responses
- short-duration or response-size-limited serverless platforms are a poor fit for the media relay

A persistent Node service close to the Plex server is the preferred deployment shape for this mode.

## Direct-play limitation

The first Plex adapter requests the exact media `Part` represented by Plex metadata. Plex can make playback decisions based on client capabilities, and some server/library/network combinations may require a playback decision or transcoding path rather than a raw Part request.

C4K does not fabricate that decision. The current adapter is therefore aimed at direct-playable authorised media. Real-server integration testing should determine which client capability and playback-decision work is needed before treating transcoding as supported.

## Verification

Plex behaviour is covered by `tests/c4kPlex.spec.js`.

The tests cover:

- IMDb Guid matching
- detailed movie metadata fetch
- Media/Part/Stream conversion
- explicit C4K labels
- HDR and high-fidelity audio mapping
- server-side-only Plex credentials
- provider dispatch
- multi-part rejection
- signed relay verification
- tampered part-key rejection
- arbitrary Plex-path rejection

Focused checks:

```bash
pnpm lint:addon
pnpm test:addon
```

## Current boundaries

Implemented:

- movie IMDb Guid lookup
- multiple single-Part Media versions
- probed Plex technical metadata mapping
- shared C4K quality ranking
- explicit source/IMAX labels
- signed Plex Part relay
- byte-range forwarding
- client-disconnect cancellation
- configurable cache and scan limits

Not yet implemented:

- multi-Part movie playback
- Plex playback-decision/transcoding integration
- TV series / episode mapping
- per-user `/configure` UI
- encrypted persistent credential storage
- device-specific compatibility profiles
- relay bandwidth/health metrics
- distributed provider caches
