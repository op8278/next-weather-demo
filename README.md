# Weather App

A small Next.js weather demo for searching places, saving cities, and viewing forecasts. Built to deploy free on Vercel with no API keys.

## Features

- Favorites city list (iOS Weather–style cards)
- Weather detail page with hourly + 7-day forecast
- Add / remove cities from the list (persisted in `localStorage`)
- Location search via Open-Meteo Geocoding
- Loading / error / retry states
- Simplified Chinese and English (local dictionaries)
- Responsive layout inspired by Apple Weather

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Saved cities list + search |
| `/weather/[id]?lat=&lon=&name=` | Weather detail for a city |

Flow:

1. Open `/` to see favorited cities (defaults to Taipei).
2. Search a city → opens detail (does **not** auto-favorite).
3. Tap ★ on detail to add/remove from the list.
4. On the list, swipe a card left to delete.

## Tech stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js App Router + TypeScript | Fits Vercel; Route Handlers for API edges |
| Styling | Tailwind CSS 4 | Fast layout without a heavy UI kit |
| Upstream weather | Open-Meteo | Free, no API key, good forecast + geocoding |
| Server API | `/api/geocode`, `/api/weather` | Proxy upstream, validate with Zod, unify response shape |
| Server state | TanStack Query | Cache, loading, retry for network data |
| UI state | Zustand | Favorites, locale, recent searches |
| Validation | Zod | Request/response contracts on the server |

### Design trade-offs

- **Query vs Zustand**: TanStack Query owns remote weather/geocode data. Zustand owns favorites and locale. Detail pages are driven by the route, not a single global “current city”.
- **Route Handler proxy**: Centralizes `{ code, data, msg }`, Zod checks, and upstream error mapping.
- **No API key**: Open-Meteo keeps deploy/demo friction at zero.
- **Local i18n only**: `zh` / `en` strings live in the repo.
- **IPv4 HTTPS helper**: Server calls Open-Meteo via Node `https` with `family: 4` so geocoding does not hang on flaky IPv6 routes.

## API contract

All app APIs return:

```json
{
  "code": 0,
  "data": {},
  "msg": "ok"
}
```

| `code` | Meaning |
| --- | --- |
| `0` | Success |
| `40001` | Invalid params |
| `40401` | Location not found |
| `50201` | Upstream Open-Meteo failed |
| `50000` | Unknown / network / parse error |

Endpoints:

- `GET /api/geocode?q=taipei`
- `GET /api/weather?lat=25.05&lon=121.53&name=Taipei`

The client (`lib/api/client.ts`) throws `ApiError` when `code !== 0`. UI maps codes to localized messages via `getErrorMessage`.

## Project structure

```
app/                  Pages + Route Handlers
components/cities/    Favorites list UI
components/weather/   Detail weather panels
hooks/                TanStack Query hooks
lib/api/              Response helpers + browser apiClient
lib/open-meteo/       Upstream fetch + Zod schemas
lib/i18n/             Local zh/en dictionaries
lib/weather/          WMO codes, URL helpers, weather fetch
stores/               Zustand app store (favorites persist)
types/                Shared API types
```

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
pnpm build
pnpm start
```

No environment variables are required.

## Deploy on Vercel

1. Push this repo to GitHub / GitLab / Bitbucket.
2. Import the project in [Vercel](https://vercel.com/new).
3. Use defaults (Framework: Next.js). Leave env vars empty.
4. Deploy. The production URL works immediately for demos.

## Persistence

Favorites, locale, and recent searches are stored in `localStorage` under `weather-app-store` via Zustand `persist`.
