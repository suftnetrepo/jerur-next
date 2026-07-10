# Sermon Model Report

## Files Created

- `app/models/sermonSeries.js`
- `SERMON_MODEL_REPORT.md`

## Files Updated

- `app/models/sermon.js`
- `app/models/index.js`

## Fields Added

### Sermon

- `churchId`
- `title`
- `speakerName`
- `serviceId`
- `seriesId`
- `biblePassages[]`
- `summary`
- `keyPoints[]`
- `applicationPoints[]`
- `prayerPoints[]`
- `tags[]`
- `media.youtubeUrl`
- `media.audioUrl`
- `media.videoUrl`
- `media.notesPdf`
- `media.thumbnail`
- `durationMinutes`
- `preachedAt`
- `status`
- `aiGenerated.summary`
- `aiGenerated.keyPoints`
- `aiGenerated.devotional`
- `aiGenerated.studyGuide`
- `createdBy`
- `updatedBy`
- `createdAt`
- `updatedAt`

### SermonSeries

- `churchId`
- `name`
- `description`
- `image`
- `color`
- `startDate`
- `endDate`
- `status`
- `createdBy`
- `createdAt`
- `updatedAt`

## Relationships

### Sermon

- `churchId -> Church`
- `serviceId -> ServiceTime`
- `seriesId -> SermonSeries`
- `createdBy -> User`
- `updatedBy -> User`

### SermonSeries

- `churchId -> Church`
- `createdBy -> User`

## Indexes

### Sermon

- `{ churchId: 1 }`
- `{ serviceId: 1 }`
- `{ preachedAt: -1 }`
- `{ status: 1 }`
- `{ tags: 1 }`
- `{ createdBy: 1 }`
- text index on `title`, `speakerName`, `summary`, `tags`

### SermonSeries

- `{ churchId: 1 }`
- `{ status: 1 }`
- `{ name: 1 }`
- `{ createdBy: 1 }`

## Validation

- Required fields are marked required in the schema.
- Enum validation is applied for sermon status and sermon series status.
- Nested `biblePassages` entries validate `book`, `chapter`, and `verseFrom` as required.
- Optional fields remain optional.
- `createdAt` and `updatedAt` are provided through mongoose timestamps.

## Assumptions Made

- `serviceId` references `ServiceTime`, which is the existing service model used elsewhere in the project.
- The existing project pattern relies on mongoose schema validation rather than separate validator files for model-only work.
- The pre-existing placeholder `app/models/sermon.js` was intentionally replaced with the requested production schema.
- `media` string fields default to empty strings to match the style used in other existing models with optional asset fields.