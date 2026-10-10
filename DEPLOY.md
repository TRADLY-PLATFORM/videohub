# Deploying VideoHub (getting a live demo URL)

The app is a static Vite SPA. Any static host works. Recommended: Vercel.

## Vercel (recommended)

```bash
npm i -g vercel
vercel
```

- `vercel.json` is already in this repo (SPA fallback rewrites + asset caching).
- Framework preset: **Vite**. Build command: `npm run build`. Output dir: `dist`.
- Env vars (only needed for live Tradly content; the demo catalog works without them):
  - `VITE_TRADLY_DOMAIN`
  - `VITE_TRADLY_PK_KEY`
  - `VITE_TRADLY_ENV=production`
- After deploy, paste the URL at the top of `README.md` as the live demo,
  and generate `public/og-image.png` (1200×630 screenshot of the browse page),
  then uncomment the `og:image` line in `index.html` and redeploy.

## Netlify

- Build command: `npm run build`, publish directory: `dist`.
- Add a `_redirects` file with `/* /index.html 200` (Vercel's `vercel.json`
  does not apply here).

## Cloudflare Pages

- Build command: `npm run build`, output: `dist`.
- Add the same SPA fallback via a `_routes.json`/redirect rule, or serve
  `index.html` for unknown paths.

## Notes

- No server needed: auth state lives in the client (redux-persist).
  Tradly calls go straight from the browser to `https://api.tradly.app`.
- Podcast RSS pages (`/podcast/:slug/rss`) render in-page. For Apple/Spotify
  ingestion, serve the feed XML as `application/rss+xml` from your
  backend/CDN — see `docs/podcast-contract.md`.
