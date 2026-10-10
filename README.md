# VideoHub — Free Video Streaming Portal Template

Launch your own **video streaming portal, TV channel, or podcast network** — a
Netflix-style storefront (movies, series, podcasts, subscriptions) powered by
React + Vite + Tradly headless APIs.

Free and open source. Connect a Tradly workspace and go live, or run the
built-in demo catalog with zero backend.

## What you get

| Area | Features |
|---|---|
| **Movies & Series** | Billboard hero with autoplay, Trending Now, Top 10, genre rows, title detail pages, continue-watching with progress |
| **Watch** | Video player pages (`/watch/:slug`), subscription-gated playback |
| **Subscriptions** | Plans page (`/plans`), enroll via Tradly Memberships API (`POST /v1/memberships`), active-membership gating |
| **Podcasts** | Shows + episodes list UX, persistent audio player (queue, 0.5–2x speed, ±15/30s skip, background + lock-screen controls), RSS 2.0 + iTunes feeds, Apple/Spotify distribution links |
| **Marketplace base** | Auth (email/phone, OTP, social), cart, checkout, orders — inherited from the Tradly boilerplate |

## Demo

```bash
npm install
npm run dev
# open http://localhost:8080/
```

No credentials needed — the app ships with a demo catalog (movies, series,
podcast shows) and falls back to it whenever the workspace has no content.

Browse: `/movies` · `/series` · `/my-list` · `/plans` · `/podcasts` ·
`/podcast/:slug` · `/episode/:slug` · `/title/:slug` · `/watch/:slug`

## Connect a Tradly workspace (go live)

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `VITE_TRADLY_DOMAIN` | Yes | Your workspace domain, e.g. `mychannel.tradly.co` |
| `VITE_TRADLY_PK_KEY` | Yes | Public key from the Tradly dashboard |
| `VITE_TRADLY_BASE_URL` | No | Defaults to `https://api.tradly.app` |
| `VITE_TRADLY_ENV` | Yes | `production` / `development` / `sandbox` |

Content mapping:

- **Video** → listings of type `video_listing` (`images[0]` backdrop, `videos[0]` stream URL)
- **Podcast episodes** → `digital` (paid) or `information_listing` (free) with the
  audio file in `videos[0]` — never `video_listing`. See
  [`docs/podcast-contract.md`](docs/podcast-contract.md) for the full field contract
- **Plans** → listings of type `membership`, one per tier; the app enrolls via
  `POST /v1/memberships` and gates playback on `status=active`

## Podcast RSS & distribution

Every show generates an RSS 2.0 + iTunes feed (`/podcast/:slug/rss`) with
enclosures, durations and episode metadata — paste the URL into Apple Podcasts
Connect or Spotify for Podcasters. Serve the path as `application/rss+xml`
from your backend/CDN in production.

## Project structure

```
src/
  pages/          # Home, Watch, Plans, Podcasts, Episode, auth, checkout…
  components/
    netflix/      # Billboard, rails, title cards
    podcast/      # Persistent player (context + mini player)
  data/           # Demo catalogs + podcast listing contract mapper
api/              # Tradly SDK wrappers (listings, cart, memberships REST…)
state/            # RTK Query APIs + Redux slices
docs/             # podcast-contract.md and guides
flows/            # Implementation guides for AI editors
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build |
| `npm run type-check` | TypeScript check |
| `npm run test:e2e` | End-to-end tests |

## Stack

React 18 · Vite 5 · Redux Toolkit + RTK Query + redux-persist · Tailwind CSS ·
React Router · Tradly JS SDK + Memberships REST

## Who is this for

Indie streaming startups, local TV channels, creators, schools, churches,
gyms, and podcast networks that want a self-hosted Netflix-style portal
without building auth, catalog, subscriptions, and RSS from scratch.

## License

MIT — see [LICENSE](LICENSE).
