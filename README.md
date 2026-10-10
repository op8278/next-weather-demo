# Weather App

A small Next.js weather demo for searching places, saving cities, and viewing forecasts. Built to deploy free on Vercel with no API keys.

中文说明见 [README.zh-CN.md](./README.zh-CN.md)。

## Demo

Live demo: [https://next-weather-demo.vercel.app/](https://next-weather-demo.vercel.app/)

## Features

- Favorites city list (iOS Weather–style cards)
- Weather detail page with hourly + 7-day forecast
- WMO weather icons next to condition text (current, hourly, daily, city cards)
- Hourly forecast: list / temperature-curve tabs for the current day
- 7-day forecast: tap a day to open a bottom sheet (viewport-anchored) with that day’s temperature curve
- Localized city labels (`zh` / `en`) resolved by Open-Meteo location id (not fuzzy name search)
- Global refresh on list and detail (left of the language switcher), with per-card / detail loading UI
- Add / remove cities from the list (persisted in `localStorage`)
- Location search via Open-Meteo Geocoding (16px input to avoid iOS focus zoom)
- Loading / error / retry states
- Simplified Chinese and English (local dictionaries)
- Responsive layout inspired by Apple Weather

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Saved cities list + search |
| `/weather/[id]?lat=&lon=&name=` | Weather detail for a city |

Flow:

1. Open `/` to see favorited cities (starts empty).
2. Search a city → opens detail (does **not** auto-favorite).
3. Tap ★ on detail to add/remove from the list.
4. On the list, swipe a card left to delete.
5. Use the refresh button to re-fetch weather; list cards and the detail page show loading while updating.

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
- **Label resolve by id**: Locale switches look up `/v1/get?id=` so city names stay exact across languages.
- **Full hourly series**: API keeps the full 7-day hourly series (including past hours today) so day curves are complete; the hourly list still shows the next 24 hours from “now”.
- **Sheet via portal**: The day sheet mounts on `document.body` so `position: fixed` tracks the viewport, not a transformed ancestor.

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

- `GET /api/geocode?q=taipei` — search by name
- `GET /api/geocode?id=1796236&lang=zh` — exact lookup by location id (localized label)
- `GET /api/weather?lat=25.05&lon=121.53&name=Taipei`

The client (`lib/api/client.ts`) throws `ApiError` when `code !== 0`. UI maps codes to localized messages via `getErrorMessage`.

## Project structure

```
app/                  Pages + Route Handlers
components/cities/    Favorites list UI
components/weather/   Detail weather panels, curve, sheet, icons
components/common/    Locale switcher, refresh, loading/error
hooks/                TanStack Query hooks
lib/api/              Response helpers + browser apiClient
lib/open-meteo/       Upstream fetch + Zod schemas
lib/i18n/             Local zh/en dictionaries
lib/weather/          WMO codes/icons, hourly windows, URL helpers
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
