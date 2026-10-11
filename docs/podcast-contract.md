# Podcast contract (frontend ↔ Tradly listings)

One rule: **never use `video_listing` for audio.** `video_listing` drives the
video player, backdrop rows and Watch CTAs everywhere. Audio reuses the
listing system but with its own type map, so video assumptions never break.

## 1. Episode types

| Case | `order_type` | Why |
|---|---|---|
| Paid episode | `digital` | An MP3 is a digital good. Cart + checkout + order flow already work; composes with Memberships gating. |
| Free episode | `information_listing` | No cart, content only. Fits free RSS-distributed episodes. |

> Platform note: this workspace returns `order_type: "listings"` for every
> listing — the content type lives in `type`. The mapper (`isAudioListing`)
> therefore reads `type`, falling back to `order_type`. Never gate on
> `order_type` alone.

`events`, `appointments`, `donation`, `requests`, `membership` and
`video_listing` are **not** podcast episodes and are ignored by the mapper.

## 2. Audio enclosure

The playable file is `listing.videos[0]` and MUST be audio:

```
.mp3 | .m4a | .aac | .wav | .ogg  (query strings allowed)
```

A listing with no audio URL in `videos[0]` is not an episode and is skipped.
`listing.images[0]` is episode/show artwork fallback.

> Write path: set `videos` via direct `PATCH /v1/listings/{id}` with body
> `{ "listing": { "videos": [...] } }`. The MCP `update_listing` wrapper drops
> this field — don't use it for media.
>
> Tradly-hosted bytes: `POST /v1/utils/S3signedUploadURL` with
> `{ "files": [{ "name": "<file>", "type": "<mime>" }] }` returns `fileUri` +
> S3 `signedUrl`; `PUT` the bytes to `signedUrl` (`Content-Type: <mime>`),
> then PATCH the listing with the `fileUri`.
> (Note: `/v1/utils/S3signedGetURL` with `{urls: [...]}` is the
> signed-*download* shape — don't use it for uploads.)

## 3. Episode metadata

Read from `listing.attributes` by **name** (case-insensitive), falling back to
`listing.metadata` with the same keys. All optional.

| Key | Meaning | Default |
|---|---|---|
| `episode_number` | Episode number | position in show (1-based, oldest first) |
| `season_number` | Season number | `1` |
| `duration_sec` | Duration in seconds | `0` = unknown, rendered as "—" |
| `explicit` | `true` / `yes` / `1` | `false` |

No attributes configured in the workspace? The episode still plays; only
numbering/duration fall back.

## 4. Show grouping

One show = one seller account (primary) or one category (fallback):

1. Group episodes by `listing.account_id`.
2. Show slug = `listing.account.slug` (fallback `account-<id>`).
3. Show title = `listing.account.name`.
4. Show artwork = `listing.account.images[0]` → else first episode image.
5. Show description = `listing.account.description` → else "".
6. If `account` is absent, group by first `listing.categories[0]`.

## 5. RSS mapping

`buildRssFeed()` (in `src/data/mockPodcasts.ts`) maps:

| RSS | Source |
|---|---|
| channel title/description/link | show title/description + `/podcast/<slug>` |
| `itunes:author`, category, explicit, image | show fields |
| item title/description/pubDate | episode title/description/`created_at` |
| `enclosure url` | episode `audioUrl` (`audio/mpeg`) |
| `guid` | `<site>/episode/<slug>` (permaLink false) |
| `itunes:duration`, `itunes:episode` | episode fields |

Apple/Spotify reject feeds with zero `<item>`s or items without
`<enclosure>` — the mapper guarantees every emitted episode has audio.

## 6. Live vs mock

`usePodcastCatalog()` (in `src/data/podcastContract.ts`) queries
`type: "digital"` + `type: "information_listing"`, maps through this contract,
and falls back to `MOCK_SHOWS`/`MOCK_EPISODES` when the workspace returns
nothing (no credentials, empty catalog, or error). Pages never branch on the
source — they render `{ shows, episodes }` either way.
