# Pastoral Care Drawer UI Report

## Summary

The Pastoral Care Case drawer was refactored into a denser case detail workspace without changing backend logic, APIs, or database models.

## UI Changes

- Replaced the basic add-follow-up form with a structured case workspace layout.
- Added a clear header with `Pastoral Care Case`, case status badge, and close control.
- Introduced a Member Summary section directly below the header.
- Added a compact two-column Case Summary section with read-only detail fields.
- Grouped Attendance Information into bordered summary cards for faster scanning.
- Reworked Pastoral Actions into a compact control area with quick status buttons, assigned pastor, and priority controls.
- Moved Internal Notes to the bottom and styled them as timeline-ready note cards.
- Added a `+ Add Note` button that focuses the note editor.
- Updated the footer to use `Cancel` and `Save Changes`, aligned bottom-right.
- Reduced vertical whitespace and improved section grouping using the existing Bootstrap-based design language.

## Data Constraints Preserved

- No backend logic was changed.
- No APIs were changed.
- No database models were changed.
- The notes area still submits the existing single `note` field, but the UI is structured to support note history later.

## Screenshots

- Before: not captured in this session.
- After: not captured in this session.

## Recommendations

- If note history is added later, the current note-card layout can be extended into a true activity timeline with no major UI rewrite.
- If member metadata such as department or member-since becomes consistently available from the existing payload, the summary section will display it automatically.