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

Light/dark/system theme is a manual toggle (header, and on login/register),
persisted via `expo-secure-store`/`localStorage` — see
`src/context/theme-context.tsx`.

## Deploying

Distributing a React Native app means producing an actual native binary,
which Expo handles via [EAS Build](https://docs.expo.dev/build/introduction/).
There's no "just push to deploy" here the way there is for the web app —
every path below produces a build you then have to install or submit
somewhere.

```bash
npm install -g eas-cli
eas login
eas build:configure   # links this project to your Expo account, if not done already
```

### Test on your own device(s) — free, no store account needed

```bash
eas build --profile preview --platform ios      # or android, or --platform all
```

This produces an installable build (an `.ipa`/`.apk`, or a QR-code install
link) without going through App Store/Play Store review. For iOS you'll
need to register test devices' UDIDs with `eas device:create` first
(`eas build` will prompt you); Android has no such restriction.

### Publish to the App Store / Play Store

This needs paid developer accounts you create yourself — I can set up the
repo-side config, but the account, payment, and store-listing steps happen
in your own Apple/Google accounts, not something to run from a terminal:

- **Apple Developer Program**: $99/year, at developer.apple.com
- **Google Play Console**: $25 one-time, at play.google.com/console

Once you have those:

```bash
eas build --profile production --platform ios
eas build --profile production --platform android
eas submit --platform ios       # uploads to App Store Connect / TestFlight
eas submit --platform android   # uploads to the Play Console
```

`eas submit` will ask for App Store Connect / Play Console credentials (or
an API key) the first time — that's the point where you're authenticating
as yourself, not something I can do on your behalf. After submitting,
Apple's review typically takes 1–3 days; Google's is usually faster.
Update `IOS_APP_URL`/`ANDROID_APP_URL` in the web app's
`frontend/src/lib/app-links.ts` once each listing is live, so the
"download the app" buttons on the landing page actually go somewhere.

`app.json` already has placeholder bundle identifiers
(`com.snip.app` for both `ios.bundleIdentifier` and `android.package`) —
change these to something you actually own before submitting, since once
published an app's identifier can't be changed.
