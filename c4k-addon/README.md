# C4K Stremio add-on

Quality-first Stremio stream resolver for authorised movie libraries.

## Local start

```bash
cp .env.example .env
node c4k-addon/server.js
```

Minimum source configuration:

```dotenv
C4K_SOURCE_INDEX_URL=https://your-authorised-index.example/api/candidates
C4K_ALLOWED_MEDIA_HOSTS=media.example.com,cdn.example.com
C4K_QUALITY_PROFILE=absolute
```

Then inspect:

```text
http://localhost:7000/manifest.json
http://localhost:7000/stream/movie/tt1234567.json
http://localhost:7000/health
```

Without both `C4K_SOURCE_INDEX_URL` and `C4K_ALLOWED_MEDIA_HOSTS`, the stream endpoint intentionally returns:

```json
{
  "streams": []
}
```

For the source contract, ranking vocabulary, deployment shape and security decisions, see [`docs/architecture/C4K_STREMIO_ADDON.md`](../docs/architecture/C4K_STREMIO_ADDON.md).
