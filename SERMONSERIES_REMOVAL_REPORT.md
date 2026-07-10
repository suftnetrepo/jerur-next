# SermonSeries Removal Report

## Files Removed

- `app/models/sermonSeries.js`
- `app/api/sermonSeries/route.js`
- `app/validation/sermonSeriesValidator.js`

## Files Modified

- `app/models/sermon.js`
- `app/models/index.js`
- `app/validation/sermonValidator.js`
- `app/services/sermonService.js`
- `app/api/sermon/route.js`
- `utils/apiUrl.js`
- `validator/rules.js`
- `hooks/useSermon.jsx`
- `app/protected/church/sermons/page.jsx`
- `app/protected/church/sermons/renderOffcanvas.jsx`
- `app/e2e/church-ops/helpers.ts`
- `app/e2e/church-ops/sermons.spec.ts`

## References Cleaned Up

- Removed `seriesId` from the Sermon schema, validator, service payload handling, and sermon API query handling.
- Removed all SermonSeries CRUD services and exports from the sermon service layer.
- Removed SermonSeries API URL definitions and the dedicated SermonSeries route.
- Removed SermonSeries filters, dropdowns, form fields, and read-only display from the Sermons UI.
- Removed SermonSeries-specific test fixture seeding and E2E test references.

## Confirmation

The Sermon module now operates without SermonSeries dependencies in the current implementation surface: model, services, APIs, UI, and E2E fixtures. Focused validation still needs to be rerun after this removal before resuming the Sermons E2E pass.