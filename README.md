# PS Plus Catalogue (SPA)

A fast, single‑page Next.js app to browse the current PlayStation Plus catalogues (Any, Games catalogue, Ubisoft+ classics, Classics catalogue, Monthly games). It fetches from four public endpoints via a serverless API proxy, merges and deduplicates, and renders a clean grid UI with search and tabs.

## Features

- Next.js App Router and Tailwind CSS + Inter font
- Serverless API route `/api/psplus` that aggregates and caches for 6h
- CORS enabled for the API route (GET/OPTIONS)
- Minimal client fetch (single request), memoized filtering and sorting
- Debounced search with clear button, resets to Any
- Tabs: Any, Games catalogue, Ubisoft+ classics, Classics catalogue, Monthly games
- Non-clickable cards showing game art; names below; text non-selectable
- Loading skeletons, error with retry, and empty state
- Deployed easily to Vercel

## Local development (Windows PowerShell)

```powershell
# From c:\Users\Admin\Music
cd c:\Users\Admin\Music\psplus-catalogue

# Install deps
npm install

# Run dev server
npm run dev
# open http://localhost:3000
```

## Build

```powershell
npm run build; npm start
```

## Environment & CORS

No secrets required. The API route calls:
- plus-games-list
- ubisoft-classics-list
- plus-classics-list
- plus-monthly-games-list

We set `Access-Control-Allow-Origin: *` so you can also call `/api/psplus` from another origin if needed.

## Deploy to Vercel

- Push this repo to GitHub (public or private)
- Create a new Vercel project and import the repo
- Framework preset: Next.js; Root directory: `psplus-catalogue` if monorepo, or root
- No env vars needed
- After deploy, access your domain; ISR will cache the proxy for ~6h

## Notes on performance

- The serverless route merges results and sorts once server-side to reduce client work
- Client filters are O(n) and use `useMemo` keyed by inputs
- Images are optimized by Next/Image; `image.api.playstation.com` is allowed in `next.config.js`

## License

MIT
