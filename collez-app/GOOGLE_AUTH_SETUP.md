# Google Auth Setup

Use this checklist to finish Google authentication for local/dev builds.

## 1) Google Cloud Console

- Create OAuth consent screen.
- Add OAuth credentials:
  - **Web client ID** (required for Supabase `signInWithIdToken`).
  - **Android client ID** (for native Android app).
  - **iOS client ID** (for native iOS app).

## 2) Environment Variables

Set these in `.env`:

- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<your-web-client-id>.apps.googleusercontent.com`

## 3) Expo App Config

In `app.json`, set the Google Sign-In plugin value:

- `iosUrlScheme` must be the reversed iOS client ID prefix, e.g.
  - iOS client ID: `1234567890-abc123def.apps.googleusercontent.com`
  - `iosUrlScheme`: `com.googleusercontent.apps.1234567890-abc123def`

## 4) Supabase Auth Provider

In Supabase dashboard:

- Enable **Google** under Auth Providers.
- Set your Google OAuth client credentials.
- Ensure redirect/auth settings are aligned with your app setup.

## 5) Build Notes

- `@react-native-google-signin/google-signin` does **not** work in Expo Go.
- Run with a development build:
  - `npx expo prebuild` (if needed)
  - `npx expo run:android` or `npx expo run:ios`
  - or use EAS build/dev-client flows.
