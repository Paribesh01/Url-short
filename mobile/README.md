# Snip (mobile)

A React Native client for Snip, built with [Expo](https://expo.dev) and
[expo-router](https://docs.expo.dev/router/introduction/). Talks to the same
Flask API as the web dashboard in `../backend`.

## Setup

```bash
npm install
cp .env.example .env   # point EXPO_PUBLIC_API_URL at your backend — see below
npx expo start
```

Then press `i` for the iOS simulator, `a` for an Android emulator, `w` for
web, or scan the QR code with Expo Go on a physical device.

## Pointing at the backend

`EXPO_PUBLIC_API_URL` in `.env` needs to resolve to your Flask backend from
wherever the app is actually running — `localhost` means something
different depending on the target:

| Target | `EXPO_PUBLIC_API_URL` |
|---|---|
| iOS simulator | `http://localhost:5000` |
| Android emulator | `http://10.0.2.2:5000` (the emulator's alias for the host) |
| Physical device (Expo Go or a dev build) | `http://<your-machine's-LAN-IP>:5000` |
| Web (`npx expo start --web`) | `http://localhost:5000` |

Also add whichever origin you're testing from to `CORS_ORIGINS` in
`backend/.env` — the web target needs its dev server's origin (typically
`http://localhost:8081`) allowed there.

## What's here

- `src/app/login.tsx`, `register.tsx` — auth screens
- `src/app/(app)/index.tsx` — link list: create, search, copy, QR code, delete
- `src/app/(app)/[code].tsx` — per-link analytics: clicks over time, top
  referrers/countries/browsers/devices, recent clicks
- `src/context/auth-context.tsx` — token-based auth, matching the web app;
  the token is stored in the platform Keychain/Keystore via
  `expo-secure-store` on iOS/Android (falls back to `localStorage` on web,
  since `expo-secure-store` has no web implementation to wrap)
- `src/app/_layout.tsx` — routes to `login`/`register` or the `(app)` group
  using `Stack.Protected`, based on auth state

Light/dark mode follows the system appearance automatically (no in-app
toggle) via the existing `ThemedView`/`ThemedText`/`useColorScheme` setup
from the Expo template.
