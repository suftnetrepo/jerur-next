# Pastoral Care UX Polish Report

## Files Modified

- `app/protected/church/pastoral-care/renderCaseOffcanvas.jsx`
- `app/protected/church/pastoral-care/page.jsx`
- `hooks/usePastoralCare.jsx`

## Interaction Improvements

- Fixed section and field labels to use proper title case instead of uppercase treatment.
- Changed the drawer to use local draft state for `status`, `assignedTo`, `priority`, and `note`.
- Quick status buttons now update locally instead of triggering an immediate server round-trip.
- Added dirty-state tracking so `Save Changes` stays disabled until the user edits something.
- Added unsaved-change confirmation when the user attempts to close the drawer.
- Saving now sends all changed fields in a single request and keeps the drawer open.
- Added a success toast after a successful save.

## Performance Optimizations

- Removed the save-time re-fetch of the full case details.
- Removed the save-time full table refresh.
- Patched the affected row locally after a successful save.
- Kept the drawer mounted and preserved local component state while editing.
- Added memoization around the drawer component and computed note timeline data.
- Preserved the drawer scroll container and scroll position during edits.

## Remaining UX Recommendations

- If the backend later supports note history, replace the single-note preview with a full audit timeline.
- Consider adding inline success/error messaging inside the drawer in addition to the toast.
- If partial row refresh becomes available server-side, the local table patch can be paired with a targeted background revalidation for extra confidence.