# Setup Dashboard E2E Report

## Executive Summary
A dedicated Playwright E2E validation was executed against the Church Setup Dashboard using a freshly provisioned church fixture and a real authenticated browser session.

The core architectural flow works:
- A new church lands on the Setup Dashboard
- The Setup Guide drawer opens and renders correctly
- Checklist content renders
- The dashboard transitions to the Live Dashboard after onboarding requirements are satisfied
- The Live Dashboard renders KPI cards and recent members
- Desktop and tablet layouts both render

Production approval is not recommended yet.

The main blockers are:
- The welcome overlay dismiss action was unreliable in the E2E run
- Console validation failed with repeated React warnings and runtime fetch errors
- Multiple failed network requests were observed during validation
- An intermittent connection reset was observed on the donations route during one run

## Test Matrix
| Scenario | Status | Notes |
| --- | --- | --- |
| Setup Mode Detection | PASS | Fresh church rendered the Setup Dashboard and not the Live Dashboard on first load. |
| View Setup Guide | PASS | Drawer opened, rendered all sections, sticky shell behavior was exercised, and Continue Setup closed it. |
| Church Setup Checklist Rendering | PASS | All checklist items rendered in setup mode with initial 0 of 7 progress. |
| Quick Actions Navigation | PASS | Quick actions were exercised successfully in the final run. |
| Empty State Cards | PASS | Attendance, Fellowship, and Members CTAs routed to their expected pages in the final run. |
| Setup Progress Update | PASS | End-state completion was validated through automatic transition to live mode after required setup data existed. |
| Dashboard Transition | PASS | After required setup data was present, page routing switched to the Live Dashboard and Setup Dashboard content disappeared. |
| Live Dashboard | PASS | KPI cards, chart region, and Recent Members rendered in live mode. |
| Regression Testing | FAIL | Functional pages mostly loaded, but earlier runs showed an intermittent donations route connection reset and final run still showed runtime/network instability. |
| Console Validation | FAIL | React warnings, failed resource loads, NextAuth client fetch errors, and failed network requests were present. |
| Responsive Validation | PASS | Validated at desktop `1440x1200` and tablet `768x1024`. |

## PASS / FAIL Table
| Area | Result |
| --- | --- |
| Fresh setup landing | PASS |
| Setup guide drawer open/close | PASS |
| Setup checklist visibility | PASS |
| Quick Actions routes | PASS |
| Empty-state CTA routes | PASS |
| Required onboarding completion transition | PASS |
| Live dashboard render | PASS |
| Members module regression | PASS |
| Attendance module regression | PASS |
| Services module regression | PASS |
| Events module regression | PASS |
| Sermons module regression | PASS |
| Pastoral Care regression | PASS |
| Donations regression | FAIL |
| Dashboard console cleanliness | FAIL |
| Network request cleanliness | FAIL |
| Responsive desktop layout | PASS |
| Responsive tablet layout | PASS |

## Screens Tested
- Desktop: `1440x1200`
- Tablet: `768x1024`

## Navigation Tested
- `/protected/church/dashboard`
- `/protected/church/members`
- `/protected/church/attendance`
- `/protected/church/regular-services`
- `/protected/church/events`
- `/protected/church/events/create`
- `/protected/church/sermons`
- `/protected/church/fellowships`
- `/protected/church/donations`
- `/protected/church/pastoral-care`

## Transition Verification
The required onboarding data was completed by seeding the same entities the dashboard service uses for onboarding aggregation:
- Church profile description and address
- First service
- Members
- Leader
- Attendance record
- Fellowship group
- Sermon

After reload:
- `onboardingCompleted` became `true`
- The Setup Dashboard no longer rendered
- The Live Dashboard rendered automatically via the dashboard entry route

This confirms the setup/live routing split is functioning.

## Regression Verification
Verified surfaces:
- Members page loaded
- Attendance page loaded
- Regular Services page loaded
- Events page loaded
- Pastoral Care page loaded
- Sermons page loaded
- Dashboard navigation remained available

Regression concern:
- A donations route load produced `net::ERR_CONNECTION_RESET` during one run
- Final regression pass still showed broader runtime/network instability via failed requests and console errors

## Console Validation
Result: FAIL

Observed in the final run:
- `CONSOLE_ERROR_COUNT 52`
- Repeated React warning: spreading a `key` prop into JSX for `KpiCard` and table row/cell rendering
- Repeated `Failed to load resource: the server responded with a status of 400 (Bad Request)`
- Repeated `ClientFetchError: Failed to fetch` from NextAuth session fetching
- Failed Sentry envelope posts in the local environment

## Failed Network / Runtime Observations
Failed requests were observed during the validation run, including requests to:
- `GET /api/auth/session`
- `GET /api/dashboard`
- `GET /api/dashboard?action=statistics`
- `GET /api/attendance?action=statistics...`
- `GET /api/event?action=paginate...`
- `GET /api/careFollowUp?action=getAll...`
- `GET /api/careFollowUp?action=dashboard...`
- Multiple Sentry ingest `POST` requests

These failures are significant because the user request explicitly required:
- no console errors
- no failed network requests
- no duplicate API calls

## Performance Observations
- Final E2E validation run duration was approximately 2.5 minutes
- Duplicate dashboard-related requests were observed, including repeated `/api/dashboard` and `/api/auth/session` calls
- Error noise was high enough to obscure clean signal during validation
- Live dashboard still rendered despite the failed requests, which suggests some errors are tolerated rather than handled cleanly

## Issues Discovered
### Critical
- Donations route instability was observed during regression validation with `net::ERR_CONNECTION_RESET` in one run. This indicates the donations surface is not reliably stable under the validated setup flow.

### Major
- The `I'll Do This Later` action on the welcome overlay did not dismiss the overlay within 15 seconds during the E2E run.
- Console validation failed due to repeated React key-prop warnings in dashboard and table rendering paths.
- Console validation failed due to repeated runtime `400 Bad Request` resource failures.
- NextAuth session fetching produced repeated `ClientFetchError: Failed to fetch` errors.
- Failed network requests were present across dashboard, attendance, events, and pastoral-care related endpoints.

### Minor
- Duplicate API activity was observed for `/api/dashboard` and `/api/auth/session`, indicating avoidable repeated fetch behavior.
- Sentry ingest failures were repeatedly emitted in the local validation environment, increasing console noise and making debugging harder.

### Cosmetic
- None confirmed beyond the console/runtime noise.

## Production Recommendation
Do not approve the Setup Dashboard for production yet.

Required before approval:
1. Fix the welcome overlay dismissal behavior so first-run users can reliably close or defer the onboarding prompt.
2. Eliminate the React `key`-prop spread warnings in dashboard and table rendering.
3. Resolve the repeated `400` resource failures and NextAuth session fetch errors.
4. Investigate the intermittent donations route connection reset.
5. Reduce duplicate dashboard/session API activity and confirm no duplicate calls during dashboard load.
6. Re-run the full setup-to-live E2E flow after the above fixes and require a clean console/network pass before release.

## Validation Artifacts
Primary E2E spec used:
- `app/e2e/church-ops/setup-dashboard.spec.ts`

Artifacts captured during runs:
- Playwright screenshots
- Playwright video
- Playwright trace
- Error context snapshots
