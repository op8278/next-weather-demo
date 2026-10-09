# Weather App

A small Next.js weather demo for searching places and viewing current conditions plus forecasts. Built to deploy free on Vercel with no API keys.

## Features

- Location search (Open-Meteo Geocoding)
- Current weather, hourly forecast, and 7-day forecast
- Loading / error / retry states
- Simplified Chinese and English (local dictionaries, no remote CMS)
- Responsive layout inspired by Apple Weather (mobile-first, centered on desktop)

## Tech stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js App Router + TypeScript | Fits Vercel; Route Handlers for API edges |
| Styling | Tailwind CSS 4 | Fast layout without a heavy UI kit |
| Upstream weather | Open-Meteo | Free, no API key, good forecast + geocoding |
| Server API | `/api/geocode`, `/api/weather` | Proxy upstream, validate with Zod, unify response shape |
| Server state | TanStack Query | Cache, loading, retry for network data |
| UI state | Zustand | Selected location, locale, recent searches |
| Validation | Zod | Request/response contracts on the server |

### Design trade-offs

- **Query vs Zustand**: TanStack Query owns remote weather/geocode data. Zustand owns client preferences and selection. Keeps server cache out of a global bag of mutable state.
- **Route Handler proxy**: Centralizes `{ code, data, msg }`, Zod checks, and upstream error mapping. The browser never talks to Open-Meteo directly.
- **No API key**: Open-Meteo keeps deploy/demo friction at zero for interviewers.
- **Local i18n only**: `zh` / `en` strings live in the repo—enough for the scope, no hot-update pipeline.
- **IPv4 HTTPS helper**: Server calls Open-Meteo via Node `https` with `family: 4` (`lib/open-meteo/http.ts`) so geocoding does not hang on flaky IPv6 routes in some networks.

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
app/api/          Route Handlers
components/       UI (search, weather panels, providers)
hooks/            TanStack Query hooks
lib/api/          Response helpers + browser apiClient
lib/open-meteo/   Upstream fetch + Zod schemas
lib/i18n/         Local zh/en dictionaries
lib/weather/      WMO code → copy / background mood
stores/           Zustand app store
types/            Shared API types
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

## Default location

First visit loads **Taipei**. Search to change city; recent selections persist in `localStorage`.
