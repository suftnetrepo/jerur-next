# Sermon UI Report

## Files Created

- `app/protected/church/sermons/page.jsx`
- `app/protected/church/sermons/renderOffcanvas.jsx`
- `hooks/useSermon.jsx`
- `SERMON_UI_REPORT.md`

## Files Modified

- `app/api/sermon/route.js`
- `app/api/sermonSeries/route.js`
- `app/validation/sermonSeriesValidator.js`
- `src/components/layouts/Sidebar/SidebarNav.tsx`
- `src/components/elements/table/table.jsx`
- `utils/apiUrl.js`
- `validator/rules.js`

## Components Reused

- Existing church admin page shell
- Shared table component
- Existing delete confirmation dialog
- Existing error dialog
- Existing offcanvas pattern from Members and Testimonies
- Existing card styling pattern from Attendance and Pastoral Care
- Existing Bootstrap form controls and buttons
- Existing debounce hook
- Existing client-side validator helper

## Screens Implemented

- Sermons list page at `/protected/church/sermons`
- KPI cards for total sermons, this month, published, and drafts
- Toolbar with search, series filter, speaker filter, status filter, date filter, and add button
- Sermons table with view, edit, and delete actions
- Add sermon drawer
- Edit sermon drawer
- View sermon drawer
- Empty state with add-sermon action

## APIs Used

- `GET /api/sermon`
- `GET /api/sermon?action=getById`
- `POST /api/sermon`
- `PUT /api/sermon?id=...`
- `DELETE /api/sermon?id=...`
- `GET /api/sermonSeries`
- `GET /api/regularService?action=paginate`

## Remaining UI Enhancements

- Add deep-link drawer state via URL query params if sermon detail linking is needed later
- Add richer speaker suggestion options if the backend later exposes distinct speaker values
- Add dedicated loading placeholders for KPI cards and drawers if the team wants skeleton states
- Add inline publish/archive quick actions if that workflow is needed on the list view