# Sermon Service Report

## Files Created

- `app/validation/sermonSeriesValidator.js`
- `SERMON_SERVICE_REPORT.md`

## Files Updated

- `app/services/sermonService.js`
- `app/validation/sermonValidator.js`

## Methods Implemented

### Sermon

- `createSermon(data, currentUser)`
- `updateSermon(id, data, currentUser)`
- `deleteSermon(id, currentUser)`
- `getSermonById(id, churchId)`
- `getAllSermons({ churchId, page, limit, search, status, seriesId, speakerId, serviceId, startDate, endDate, sortField, sortOrder })`
- `getLatestSermons({ churchId, limit })`
- `searchSermons({ churchId, query, page, limit })`
- `getSermonsBySpeaker({ churchId, speakerId, speakerName, page, limit })`
- `getSermonsBySeries({ churchId, seriesId, page, limit })`
- `publishSermon(id, currentUser)`
- `archiveSermon(id, currentUser)`

### SermonSeries

- `createSermonSeries(data, currentUser)`
- `updateSermonSeries(id, data, currentUser)`
- `deleteSermonSeries(id, currentUser)`
- `getSermonSeriesById(id, churchId)`
- `getAllSermonSeries({ churchId, page, limit, search, status })`
- `completeSermonSeries(id, currentUser)`

## Query Filters Supported

### Sermons

- `churchId`
- `search`
- `status`
- `seriesId`
- `speakerId`
- `speakerName`
- `serviceId`
- `startDate`
- `endDate`
- `sortField`
- `sortOrder`

### SermonSeries

- `churchId`
- `search`
- `status`
- `sortField`
- `sortOrder`

## Pagination Behaviour

- Paginated list methods follow the existing project response pattern:
  - `data`
  - `totalCount`
  - `page`
  - `limit`
  - `pages`
- Pagination uses `skip = (page - 1) * limit`.
- Sorting follows the existing `sortField` / `sortOrder` pattern used across the project.

## Assumptions Made

- `speakerId` is not stored directly on the Sermon model, so when provided it is resolved to a church-scoped `User` and matched against the stored `speakerName` value.
- `serviceId` continues to reference `ServiceTime`, matching the existing service model in the codebase.
- Delete behavior follows the current service pattern in this project and uses hard deletes scoped by `churchId`.
- Deleting a sermon series does not cascade to sermons and does not unset existing `seriesId` references.
- Useful population for sermons includes `serviceId`, `seriesId`, `createdBy`, and `updatedBy`; sermon series populate `createdBy`.