# Member Status Aggregate Fix Report

## Root Cause

- The status chip counts were sourced from a Mongo aggregation in `app/services/memberService.js`.
- The paginated member query used `Member.find(...)`, where Mongoose cast the church id string automatically.
- The aggregate query used `Member.aggregate([{ $match: { church: suid } }])`, where the `church` filter stayed a string instead of an `ObjectId`.
- Because `Member.church` is stored as an `ObjectId`, the aggregation match returned no rows, so every chip count rendered as `0`.

## Files Modified

- `app/services/memberService.js`
- `app/api/member/route.js`
- `hooks/useMember.jsx`

## API Changes

- Reused the existing `GET /api/member?action=getAll` endpoint.
- Added explicit aggregate data to the existing response without creating a new API.
- The response now includes:

```json
{
  "members": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 200
  },
  "aggregates": {
    "total": 200,
    "active": 140,
    "provisional": 32,
    "underDiscipline": 12,
    "inactive": 16
  }
}
```

- Backward-compatible fields remain in place for the current page flow (`data`, `totalCount`, `statusCounts`).

## Aggregate Implementation

- Added `normalizeMemberAggregateQuery()` in `app/services/memberService.js` to cast `church` to `mongoose.Types.ObjectId` before running the aggregation pipeline.
- Kept the chip totals server-side.
- Aggregate totals are computed from the full church dataset after search filtering and before applying the selected status chip.
- Clicking a status chip still filters the table rows, but the aggregate counts continue to represent the complete filtered dataset for that church search scope.
- `hooks/useMember.jsx` now prefers the explicit `aggregates` payload instead of deriving totals from the current page.

## Verification That Chip Counts Match The Database Totals

- Ran a direct Mongo verification against the local database.
- For church `696b72e203ad97f1331f2976`, the pre-fix aggregate style returned an empty result:

```json
[]
```

- The corrected aggregate returned:

```json
[
  { "_id": "active", "count": 8 },
  { "_id": "inactive", "count": 4 },
  { "_id": "provisional", "count": 4 },
  { "_id": "under discipline", "count": 4 }
]
```

- The same church has `20` total members in `Member.countDocuments(...)`.
- This matches the expected aggregate totals:
  - `total: 20`
  - `active: 8`
  - `provisional: 4`
  - `underDiscipline: 4`
  - `inactive: 4`