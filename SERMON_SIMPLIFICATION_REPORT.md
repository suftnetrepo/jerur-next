# Sermon Simplification Report

## Purpose

The Sermon module now operates as a lightweight Sermon Library for church administrators to publish sermons for the Jerur mobile application.

Members can select a sermon in the mobile app and open the first available sermon media URL.

Priority order for playback:

1. YouTube
2. Video
3. Audio

This module is no longer structured as a sermon preparation, note-taking, or AI-assisted content authoring system.

## Fields Removed

Removed from the Sermon model and related validation/UI flow:

- `biblePassages`
- `keyPoints`
- `applicationPoints`
- `prayerPoints`
- `tags`
- `aiGenerated`
- `media.notesPdf`

## Files Modified

- `app/models/sermon.js`
- `app/validation/sermonValidator.js`
- `app/services/sermonService.js`
- `app/api/sermon/route.js`
- `hooks/useSermon.jsx`
- `validator/rules.js`
- `app/protected/church/sermons/renderOffcanvas.jsx`
- `app/e2e/church-ops/helpers.ts`
- `app/e2e/church-ops/sermons.spec.ts`

## Validation Changes

Required fields now are:

- `title`
- `speakerName`
- `serviceId`
- `preachedAt`
- `status`
- at least one media URL in `media.youtubeUrl`, `media.videoUrl`, or `media.audioUrl`

Optional fields now are:

- `summary`
- `durationMinutes`
- `media.thumbnail`

Additional validation updates:

- `serviceId` is now required instead of optional.
- `media.notesPdf` validation was removed.
- AI-related validation rules were removed.
- Client-side drawer validation now blocks save when no playable media URL is supplied.

## UI Changes

Admin drawer edit mode now only includes:

- Title
- Speaker
- Service
- Date Preached
- Duration
- Status
- Summary
- YouTube URL
- Audio URL
- Video URL
- Thumbnail URL

Removed from the admin drawer:

- Bible Passage
- Sermon Content helper lists
- Prayer Points
- Application Points
- Key Points
- Tags
- AI Features / future AI placeholders

View drawer now displays only:

- Title
- Speaker
- Service
- Date
- Duration
- Summary
- Media Links

If a playable media URL exists, the view drawer shows:

- `▶ Play Sermon`

That button opens the first available media URL using the required priority order.

The table columns remain limited to:

- Title
- Speaker
- Service
- Date
- Duration
- Status
- Actions

## API Changes

The Sermon API continues to use the existing route and service architecture.

Updated behavior:

- create and update payloads now accept only the simplified Sermon Library fields
- obsolete note-taking and AI fields are no longer serialized or validated
- media payloads are normalized to `youtubeUrl`, `audioUrl`, `videoUrl`, and `thumbnail`
- `serviceId` is required for persisted sermons
- server-side validation enforces at least one playable media URL

## Confirmation

The Sermon module is now aligned to a lightweight Sermon Library for the Jerur mobile application.

It stores only the metadata needed to publish a sermon, describe it briefly, and send members to the sermon playback URL.