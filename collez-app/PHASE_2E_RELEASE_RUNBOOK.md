# Phase 2E Release Runbook

This runbook covers `2E.5` deployment steps.

## Preconditions

- Migrations up to Phase 2E applied in Supabase.
- Edge function `log-streak-action` deployed.
- App typecheck passes: `npx tsc --noEmit`.

## 1) OTA Update (JS-only changes)

Use OTA when there are no native dependency/plugin changes.

```bash
eas update --branch production --message "Phase 2E: streak shield + city/state leaderboard + perf optimizations"
```

## 2) Full Native Build (if required)

Run a new native build if any native module/plugin/config changed.

```bash
eas build --platform android --profile production
```

## 3) Quick Post-Deploy Validation

1. Open app and verify Home loads.
2. Activate streak shield from streak pill (if available).
3. Open rankings and verify `City` and `State` tabs.
4. Verify profile/friends/rankings screens scroll smoothly.
5. Verify no new runtime errors in console.

## 4) Rollback Strategy

- If OTA issue appears:
  - Publish a hotfix OTA update with corrected JS bundle.
- If native issue appears:
  - Revert to previous production build in release process.
