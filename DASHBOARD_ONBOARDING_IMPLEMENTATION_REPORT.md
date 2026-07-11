# Dashboard Onboarding Implementation Report

## Summary

Implemented a first-time onboarding experience for newly provisioned churches on the church dashboard. The dashboard now automatically switches between:

- Church Setup Mode: shown when onboarding is incomplete
- Operational Dashboard: shown when onboarding is complete

The implementation reuses the existing dashboard API and existing church update endpoint, with onboarding state persisted on the `Church` document so it is shared across admins.

## Files Modified

- `app/models/church.js`
- `app/services/dashboardService.js`
- `hooks/useChurchDashboard.tsx`
- `app/protected/church/dashboard/page.jsx`

## Persistence Model

Added a nested `onboarding` object to the `Church` schema with:

- `welcomeModalDismissed`
- `setupChecklistDismissed`
- `onboardingCompleted`

Persistence is handled through the existing bulk church update route:

- `PUT /api/church/update?action=bulk`

No new onboarding-specific API route was introduced.

## Dashboard Backend Changes

Extended `getDashboardAggregates()` and `getDashboardStatistics()` to compute church setup progress from existing module data.

Data sources reused:

- `Church` for profile completeness and persisted onboarding flags
- `ServiceTime` for first service
- `Member` for members and leaders/pastors
- `Fellowship` for fellowship groups
- `Attendance` for attendance activity and peak attendance
- `Sermon` for sermon library presence
- `Donation` for donation presence on smart empty states
- `Event` for event counts and upcoming events

The dashboard aggregate response now includes:

- standard KPI counts
- upcoming events count
- donations count
- onboarding summary payload
- minimal church profile metadata

The onboarding payload shape is:

```json
{
  "dismissed": false,
  "setupChecklistDismissed": false,
  "completedCount": 0,
  "totalCount": 7,
  "percentage": 0,
  "completed": false,
  "tasks": {
    "churchProfile": false,
    "firstService": false,
    "members": false,
    "leaders": false,
    "fellowships": false,
    "attendance": false,
    "sermons": false
  }
}
```

## Completion Rules

The checklist marks a step as complete when:

- `churchProfile`: church has name, email, mobile, description, and address data
- `firstService`: at least one `ServiceTime` exists
- `members`: at least one `Member` exists
- `leaders`: at least one `Member` exists with role `leader` or `pastor`
- `fellowships`: at least one `Fellowship` exists
- `attendance`: at least one `Attendance` record exists
- `sermons`: at least one `Sermon` exists

Onboarding is automatically marked complete when all seven steps are complete.

## Frontend Dashboard Changes

Updated the church dashboard page to render two modes from the same dashboard response.

### Church Setup Mode

Added:

- welcome modal for first-time setup
- setup checklist card with progress bar and percentage
- quick actions card
- secondary setup progress panel
- smart empty states for attendance, donations, members, events, and sermons

Behavior:

- `Get Started` dismisses the modal and scrolls to the checklist
- `I'll Do This Later` dismisses the modal only
- dismissing the setup checklist persists `setupChecklistDismissed`
- KPI cards remain visible during setup mode

### Operational Dashboard

When onboarding is complete, the dashboard shows the standard operational view:

- KPI cards
- attendance chart
- user aggregates chart
- recent members table

The onboarding modal and checklist are hidden automatically.

## Hook Changes

Updated `useChurchDashboard` to:

- retain aggregate response in `data`
- store statistics separately in `statisticsData`
- expose `fetchAll()` for dashboard refresh after onboarding state updates
- stabilize fetch callbacks to satisfy hook dependency linting

## Additional Backend Fixes

While extending the dashboard service, corrected dashboard data issues in the existing service layer:

- normalized church ID handling with `ObjectId`
- fixed attendance filtering to use `Attendance.church`
- fixed member aggregate matching to use `ObjectId`
- added upcoming events count separate from total events count

## Validation Performed

Static diagnostics:

- `get_errors` on all modified onboarding files returned no errors

Executable validation:

```bash
./node_modules/.bin/eslint app/protected/church/dashboard/page.jsx hooks/useChurchDashboard.tsx app/services/dashboardService.js app/models/church.js
```

Result:

- passed with no lint errors or warnings
- environment emitted an existing TypeScript version support warning from `@typescript-eslint/typescript-estree`

## Notes

- The implementation reuses existing Jerur cards, charts, and endpoint patterns rather than introducing a new dashboard subsystem.
- Onboarding dismissals are persisted at the church level, so multiple admins see the same setup state.
- No unrelated modules were changed.