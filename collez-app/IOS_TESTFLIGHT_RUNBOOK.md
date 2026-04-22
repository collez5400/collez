# COLLEZ iOS Port + TestFlight Runbook (Phase 4B.1)

## Scope
- Apple Sign-In enabled via `expo-apple-authentication`.
- iOS safe-area and bottom navigation spacing updated.
- TestFlight release checklist prepared for internal and external beta.

## Preflight
- Confirm `app.json` has `ios.bundleIdentifier = com.collez.app`.
- Confirm `app.json` has `ios.usesAppleSignIn = true`.
- Confirm Apple Sign-In capability is enabled for the App ID in Apple Developer.
- Confirm Supabase Apple provider is enabled with the correct Services ID and keys.

## Build Commands
```bash
npx eas build -p ios --profile preview
npx eas submit -p ios --profile production
```

## Test Matrix (No Browser Required)
- Authentication:
  - Google Sign-In still works on iOS build.
  - Apple Sign-In appears only on iOS and completes profile creation for first-time users.
  - Existing user Apple Sign-In restores profile without onboarding reset.
- Navigation/Layout:
  - Bottom tab bar stays above home indicator on iPhone models with notch.
  - Tab hit areas remain comfortable and labels/icons do not clip.
  - Login card + legal row are visible across small/large iPhone screens.
- Core Flows:
  - Home load, Rankings, Friends, Vault, Profile.
  - Premium themes entry from Settings.
  - Friend challenge compare route and event routes open normally.

## TestFlight Rollout Sequence
1. Upload `preview` build to App Store Connect.
2. Add internal testers and verify crash-free launch + auth flows.
3. Promote to external testing with staged groups:
   - Group A: coordinators
   - Group B: non-coordinator users
4. Collect blockers and regressions; patch via EAS update when possible.

## Exit Criteria
- Authentication parity: Google + Apple both functional.
- No iOS-specific clipping/layout blockers.
- Internal tester sign-off complete for auth, nav, and home flow.
