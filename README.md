# Snip

A URL shortener with real analytics: referrers, geography, devices, and
click trends over time. Built to learn Redis-backed caching and
time-series-style analytics queries on top of Postgres.

- **Frontend:** Next.js (App Router, TypeScript, Tailwind, shadcn/ui)
- **Backend:** Flask (SQLAlchemy, Redis, Postgres)
- **Database:** Postgres (defaults to a managed instance, e.g. Neon)
- **Cache:** Redis, caching short-code → destination-URL redirect lookups

## Project structure

```
urlShort/
├── frontend/          Next.js app (landing page + dashboard)
├── mobile/            Expo / React Native app (same API, on iOS/Android/web)
├── backend/           Flask API (shortening, redirects, analytics)
└── docker-compose.yml Local Redis (and optional local Postgres)
```

## How it works

- `POST /api/urls` creates a short code for a destination URL (or accepts
  a custom code and an optional expiration date). Works whether or not
  you're signed in — an anonymous link just isn't tied to any account,
  so it won't show up in anyone's dashboard.
- `GET /<code>` resolves the short code and 302-redirects to the
  destination. The lookup is cached in Redis so repeat traffic to a
  link skips the database. Every hit is logged as a `Click` row:
  referrer, IP-derived country/city, and a parsed browser/OS/device
  from the user agent.
- `GET /api/urls/<code>/analytics` aggregates those `Click` rows into
  clicks-over-time, top referrers, top countries, top browsers, and
  top devices for the dashboard.
- Accounts are JWT-based (`POST /api/auth/register`, `/login`, `GET
  /me`): the frontend sends `Authorization: Bearer <token>` on every
  request that needs to know who's calling. Listing, deleting, and
  viewing analytics for links all require auth and are scoped to the
  caller's own links.

## Features

- Shorten a URL with an optional custom code, title, and expiration date
- Per-link analytics: clicks over time, top referrers/countries/
  browsers/devices, recent click activity
- Redis-cached redirects
- Accounts (JWT auth) — your dashboard only ever shows your own links
- QR code for any short link, from the table or the analytics page
- Dark mode
- Search/filter your links on the dashboard

## Prerequisites

- Node.js 20+
- Python 3.11+
- A Postgres database (a free [Neon](https://neon.tech) instance works
  well, or run one locally — see below)
- Redis (via Docker, or installed locally)

## 1. Start Redis

```bash
docker compose up -d redis
```

Don't have Docker? Install Redis directly (`brew install redis` on
macOS) and run `redis-server`.

### Optional: run Postgres locally too

If you'd rather not use a managed Postgres instance:

```bash
docker compose --profile local-db up -d postgres
```

This starts Postgres on `localhost:5432` with user/password/db all set
to `urlshort`. Point `DATABASE_URL` (below) at
`postgresql://urlshort:urlshort@localhost:5432/urlshort`.

## 2. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # on Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env` and set `DATABASE_URL` to your Postgres connection
string. Then run the server:

```bash
python3 run.py
```

The API starts on `http://localhost:5000` and creates its tables
automatically on first run (`db.create_all()` in the app factory).
Check `http://localhost:5000/api/health` to confirm it's up.

## 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local   # defaults already point at localhost:5000
npm run dev
```

The app starts on `http://localhost:3000`.

- `/` — landing page with a live shortener widget (no account needed)
- `/register`, `/login` — create an account or sign in
- `/dashboard` — create links, view the list, see summary stats
  (requires signing in)
- `/dashboard/<code>` — per-link analytics: clicks over time, top
  referrers/countries/browsers/devices, recent click activity

## 4. Mobile setup (optional)

The same product also has a React Native client in `mobile/`, built with
Expo — same login/dashboard/analytics/QR features, native on iOS and
Android. See [`mobile/README.md`](mobile/README.md) for setup; the one
thing to get right is `EXPO_PUBLIC_API_URL`, since `localhost` resolves
differently depending on whether you're running in an iOS simulator, an
Android emulator, or on a physical device.

## Deploying the backend to Render

The backend already runs on gunicorn locally (`backend/requirements.txt`
includes it), and there's a `render.yaml` Blueprint at the repo root that
Render auto-detects.

1. **Get a Redis instance.** Local dev uses `redis-server` on your machine,
   which obviously isn't reachable from Render. Either add a Render "Key
   Value" service (New → Key Value in the dashboard) or use a free
   [Upstash](https://upstash.com) Redis — either way you'll get a
   connection string for `REDIS_URL`. Postgres needs no equivalent step
   here since this project already defaults to a managed instance (Neon).
2. **New → Blueprint** in the Render dashboard, pointing at this repo.
   Render reads `render.yaml` and creates a web service named
   `snip-backend` with `rootDir: backend`, `pip install -r
   requirements.txt` as the build command, and `gunicorn -w 2 -b
   0.0.0.0:$PORT run:app` as the start command.
3. Render will prompt for the env vars marked `sync: false` in
   `render.yaml` — fill in `DATABASE_URL` (your Neon connection string),
   `REDIS_URL` (from step 1), and `CORS_ORIGINS` (leave this for step 4).
   `SECRET_KEY` is auto-generated; don't reuse your local dev value.
4. Once deployed, Render gives you a URL like
   `https://snip-backend.onrender.com`. Go back into the service's
   environment settings and set `BASE_URL` to that URL (it's used to
   compose the `short_url` field the API returns), and `CORS_ORIGINS` to
   whatever origin your deployed frontend runs on (e.g. a Vercel domain).
   Mobile requests aren't subject to CORS, so nothing to add there.
5. Point the frontend and mobile app at the new backend:
   `NEXT_PUBLIC_API_URL` / `EXPO_PUBLIC_API_URL` = your Render URL.

The free Render plan spins the service down after inactivity and takes a
few seconds to wake back up on the next request — expect a slow first
redirect/API call after idle periods, not a broken deploy.

## Environment variables

**`backend/.env`** (see `backend/.env.example`)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `REDIS_URL` | Redis connection string |
| `BASE_URL` | Used to compose the full short link returned by the API |
| `SECRET_KEY` | Flask secret key; also signs auth JWTs |
| `CORS_ORIGINS` | Comma-separated origins allowed to call the API — add `http://localhost:8081` if you're testing the mobile app's web target |

**`frontend/.env.local`** (see `frontend/.env.example`)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the Flask API |

## Notes

- Geolocation uses the free `ip-api.com` lookup and gracefully falls
  back to "Unknown" (or "Local" for private/loopback IPs) if the
  lookup fails — click tracking never breaks because of it.
- `SQLALCHEMY_ENGINE_OPTIONS` enables `pool_pre_ping` and a 5-minute
  `pool_recycle`, since managed Postgres providers like Neon can close
  idle connections server-side.
