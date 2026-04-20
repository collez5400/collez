## Deploy COLLEZ app (Web Preview) to Vercel

This deploys the **Expo Web export** so you can preview the UI in a browser.
It is **not** the Android/iOS build (that still requires Expo/Android build later).

### 1) Prereqs
- Node.js installed
- A Vercel account

### 2) Deploy (recommended: Vercel CLI)
From `collez-app/`:

```bash
npm install
npx vercel
```

On the first prompt:
- Set **root directory** to `collez-app`
- Build command uses `vercel.json` (`npm run vercel-build`)
- Output directory is `dist`

### 3) What Vercel runs
- `npm run vercel-build` → `npx expo export --platform web`
- Static files are served from `dist/`
- All routes are rewritten to `/index.html` for Expo Router web navigation

### 4) Notes / limitations
- Any device-only functionality may be limited on web (e.g., some native modules).
- This is meant for **fast UI review**, not production mobile distribution.

