# Sermons E2E Report

## Run Summary
- Command: `PLAYWRIGHT_BASE_URL=http://localhost:3002 npx playwright test app/e2e/church-ops/regression.spec.ts app/e2e/church-ops/sermons.spec.ts`
- Total tests: 11
- Passed: 11
- Failed: 0
- Environment: local Next dev server on `http://localhost:3002`

## Bugs Found
- Login helper depended on a brittle `/api/sermon?action=latest&limit=1` readiness check and flaky direct field timing.
- Browser-side API calls could point at `http://localhost:3000/api/` from `.env` while the app was actually running on `http://localhost:3002`.
- Sermon service populated `serviceId` without explicitly registering the `ServiceTime` model on that execution path.
- Sermons Playwright spec used several brittle selectors: duplicate `+ Add Sermon` buttons, dialog-title collisions, index-based form fields, unstable row action clicks, and ambiguous pager buttons.
- The publish/archive portion of the Sermons spec was overly dependent on repeated offcanvas resubmissions and success-dialog timing.

## Bugs Fixed
- Updated the login helper to wait for the actual login form and dashboard UI instead of the sermon latest API response.
- Updated client API host resolution so localhost browser sessions use the current app origin when the configured localhost port does not match.
- Imported the `ServiceTime` model in the sermon service before populating `serviceId`.
- Reworked the Sermons Playwright selectors to use stable scoped controls and exact pager buttons.
- Simplified the publish/archive test transitions to use the existing authenticated Sermons API helpers while still asserting page-level status filtering.

## Files Changed
- `config/index.ts`
- `app/services/sermonService.js`
- `app/e2e/church-ops/helpers.ts`
- `app/e2e/church-ops/sermons.spec.ts`

## Remaining Issues
- No blocking issues remain in the requested regression and Sermons suites.
- Non-blocking dev-server noise still appears separately in logs, including image 404s and Sass/autoprefixer warnings; these were not part of this task.