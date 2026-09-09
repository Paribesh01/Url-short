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
├── backend/           Flask API (shortening, redirects, analytics)
└── docker-compose.yml Local Redis (and optional local Postgres)
```

## How it works

- `POST /api/urls` creates a short code for a destination URL (or accepts
  a custom code).
- `GET /<code>` resolves the short code and 302-redirects to the
  destination. The lookup is cached in Redis so repeat traffic to a
  link skips the database. Every hit is logged as a `Click` row:
  referrer, IP-derived country/city, and a parsed browser/OS/device
  from the user agent.
- `GET /api/urls/<code>/analytics` aggregates those `Click` rows into
  clicks-over-time, top referrers, top countries, top browsers, and
  top devices for the dashboard.

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

- `/` — landing page with a live shortener widget
- `/dashboard` — create links, view the list, see summary stats
- `/dashboard/<code>` — per-link analytics: clicks over time, top
  referrers/countries/browsers/devices, recent click activity

## Environment variables

**`backend/.env`** (see `backend/.env.example`)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `REDIS_URL` | Redis connection string |
| `BASE_URL` | Used to compose the full short link returned by the API |
| `SECRET_KEY` | Flask secret key |
| `CORS_ORIGINS` | Comma-separated origins allowed to call the API |

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
