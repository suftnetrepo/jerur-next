# Member Status Filter Report

## Files Modified

- `app/protected/church/members/page.jsx`
- `hooks/useMember.jsx`
- `app/api/member/route.js`
- `app/services/memberService.js`

## Aggregate Source

- Reused the existing Members endpoint and existing member status aggregation logic in `app/services/memberService.js`.
- `getMembers()` now returns `statusCounts` alongside the paginated member rows.
- Counts are computed from the current member dataset after search filtering and before applying the selected status chip, so the chips show the status distribution for the current result set.

## Filter Behaviour

- Added a `Status` chip row below the search bar.
- Chips available: `All`, `Active`, `Provisional`, `Under Discipline`, `Inactive`.
- Clicking a chip filters the members table through the existing members list request.
- Chip changes reset the members table pagination to page 1.
- The selected chip uses the filled `primary` button style; unselected chips use the outlined style to match the Attendance filter treatment.
- Search, sorting, pagination, add, edit, and delete remain on the existing Members flow.
- After create, edit, or delete, the page refreshes the current members slice so the chip counts stay in sync with the latest data.

## API Changes

- No new API route was created.
- Extended `GET /api/member?action=getAll` to accept an optional `status` query parameter.
- Extended `GET /api/member?action=getAll` to return `statusCounts` with this shape:

```json
{
  "all": 0,
  "active": 0,
  "provisional": 0,
  "under discipline": 0,
  "inactive": 0
}
```