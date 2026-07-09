# Attendance Date Filter Report

## Files Modified

- `app/protected/church/attendance/page.jsx`
- `hooks/useAttendance.jsx`
- `app/api/attendance/route.js`
- `app/services/attendanceService.js`

## APIs Updated

- Extended the existing `GET /api/attendance?action=byService` query path to accept `startDate` and `endDate`.
- Extended the existing `GET /api/attendance?action=dashboard` query path to accept `startDate` and `endDate`.
- Reused the existing attendance statistics query path, which already supported date range filtering.

## Default Date Logic

- On first load, the Attendance dashboard now derives the most recent Sunday.
- That Sunday is used as the default selected date when no persisted filter exists.
- The selected date is converted into a full-day `startDate` / `endDate` range before requests are sent.

## Filter Behaviour

- Replaced the service chip selector with a compact filter bar in this order: Service, Date, Search, Attendance Status.
- Changing Service refreshes KPI cards, attendance status chips, and the attendance table.
- Changing Date refreshes KPI cards, attendance status chips, and the attendance table.
- Search applies within the currently selected service, date, and attendance status.
- Attendance Status chips continue to filter the current service/date dataset.
- Selected Service, Date, Attendance Status, and Search text are persisted in local storage and restored on return.

## Performance Considerations

- The implementation reuses the existing attendance endpoints rather than introducing new APIs.
- Date filtering is applied server-side in the existing attendance-by-service query to avoid loading unnecessary records to the client.
- Existing debounced search behavior remains in place.
- Filter persistence is lightweight and uses local storage to avoid extra network requests.