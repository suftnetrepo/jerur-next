# Sermon API Report

## Routes Created

- `app/api/sermon/route.js`
- `app/api/sermonSeries/route.js`

## Actions Supported

### Sermon

- `POST` create sermon
- `GET?action=getById` get sermon by id
- `GET?action=latest` get latest sermons
- `GET?action=search` search sermons
- `GET?action=bySpeaker` get sermons by speaker
- `GET?action=bySeries` get sermons by series
- `GET` list sermons
- `PUT?action=publish` publish sermon
- `PUT?action=archive` archive sermon
- `PUT` update sermon
- `DELETE` delete sermon

### SermonSeries

- `POST` create sermon series
- `GET?action=getById` get sermon series by id
- `GET` list sermon series
- `PUT?action=complete` complete sermon series
- `PUT` update sermon series
- `DELETE` delete sermon series

## Validators Created

- Updated `app/validation/sermonValidator.js`
- Added `app/validation/sermonSeriesValidator.js`

Validation covers:

- sermon `title`
- sermon `speakerName`
- sermon `preachedAt`
- sermon `status`
- sermon `biblePassages`
- sermon media URL fields
- sermon series `name`
- sermon series `status`
- sermon series `startDate` / `endDate`

## Authorization Rules

- Read operations require an authenticated session.
- Write operations require an authenticated session and one of:
  - `admin`
  - `ADMIN`
  - `pastor`
  - `PASTOR`
  - `media_team`
  - `MEDIA_TEAM`

## Example Request Payloads

### Create Sermon

```json
{
  "title": "Faith Over Fear",
  "speakerName": "Pastor James",
  "serviceId": "687000000000000000000001",
  "seriesId": "687000000000000000000002",
  "biblePassages": [
    {
      "book": "Joshua",
      "chapter": 1,
      "verseFrom": 9,
      "verseTo": 9
    }
  ],
  "summary": "A message on courage and trust in God.",
  "keyPoints": ["God is present", "Courage is commanded"],
  "applicationPoints": ["Pray before acting"],
  "prayerPoints": ["Pray for boldness"],
  "tags": ["faith", "courage"],
  "media": {
    "youtubeUrl": "https://youtube.com/watch?v=example",
    "notesPdf": "https://example.com/notes.pdf"
  },
  "durationMinutes": 42,
  "preachedAt": "2026-07-13T09:00:00.000Z",
  "status": "DRAFT",
  "aiGenerated": {
    "summary": false,
    "keyPoints": false,
    "devotional": false,
    "studyGuide": false
  }
}
```

### Create Sermon Series

```json
{
  "name": "Faith That Endures",
  "description": "A teaching series on perseverance and trust.",
  "image": "https://example.com/series.jpg",
  "color": "#1F3A5F",
  "startDate": "2026-07-01T00:00:00.000Z",
  "endDate": "2026-08-31T00:00:00.000Z",
  "status": "ACTIVE"
}
```

## Example Response Payloads

### Success

```json
{
  "data": {
    "_id": "687000000000000000000010",
    "title": "Faith Over Fear"
  },
  "success": true
}
```

### List Success

```json
{
  "data": [],
  "totalCount": 0,
  "page": 1,
  "limit": 10,
  "pages": 0,
  "success": true
}
```

### Validation Error

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "title",
      "message": "The 'title' field is required."
    }
  ]
}
```

### Authorization Error

```json
{
  "success": false,
  "error": "Forbidden"
}
```