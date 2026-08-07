# Migrations

This is the standard way to evolve the MongoDB schema or backfill/update
existing production data. It never runs automatically - only when someone
explicitly runs `npm run migrate`.

## How it works

- Every file in this directory is a migration.
- `scripts/run-migrations.js` runs them in filename order and records each
  one it successfully runs in a `migrations` collection in the same
  database the app already uses.
- Before running a migration, the runner checks the `migrations` collection
  for a record with that migration's name. If one exists, the migration is
  skipped. **A migration only ever runs once** against a given database.
- If a migration throws, the run stops immediately - migrations after it
  are not attempted, so you never end up with migration 3 applied while
  migration 2 (which it may depend on) silently failed.

## Naming convention

```
NNN-short-description.js
```

- `NNN` is a zero-padded, 3+ digit, strictly increasing number (`001`,
  `002`, ... `010`, `011`, ...). The runner sorts filenames alphabetically
  to decide execution order, and zero-padding is what keeps that sort equal
  to numeric order - `010` must not be written as `10`, or it would sort
  before `002`.
- Pick the next number in sequence; don't reuse or renumber a migration's
  number once it has been committed/executed anywhere, even retroactively -
  the number is permanently tied to that migration's identity in the
  `migrations` history collection.
- The description is a short, kebab-case summary of what the migration
  does (`add-notification-field`, not `fix-bug` or `update-1`).

## Creating a new migration

Create a new file following the naming convention above. It must have a
default export matching:

```js
// migrations/003-your-migration-name.js
import Church from '../app/models/church';

export default async function migrate(session) {
  const result = await Church.updateMany(
    { someField: { $exists: false } },
    { $set: { someField: 'default value' } },
    { session }
  );

  // Optional: returned here just to show up in the runner's summary output.
  return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
}
```

- Import whatever models/utilities you need directly (same paths you'd use
  anywhere else in the codebase, e.g. `../app/models/church`) - the runner
  already has the shared database connection open (via
  `utils/connectDb.js`) by the time your migration runs, so you don't need
  to connect yourself.
- The `session` argument is optional and can be ignored. When the database
  deployment supports transactions (Atlas always does; this project's `.env`
  points at Atlas), the runner opens one per migration and passes it in -
  pass `{ session }` through to your Mongo/Mongoose calls to have your
  migration's writes and its "recorded as executed" bookkeeping succeed or
  roll back together. If you don't pass the session along, your writes just
  aren't covered by that atomicity guarantee - the migration will still run
  and still be correctly recorded once, but a crash partway through could
  leave your part-applied.
- Returning an object from `migrate()` is optional, but it gets logged in
  the runner's summary and end-of-run report, so it's the easiest way to
  show how many documents were touched.

## Running migrations

```bash
npm run migrate
```

Console output looks like:

```
Connecting to database...
Running migration: 001-add-notification-field...
Completed: 001-add-notification-field ({"matchedCount":12,"modifiedCount":12})
Skipped: 002-add-mobile-features (already executed)

All migrations processed.

Summary:
  [completed] 001-add-notification-field - {"matchedCount":12,"modifiedCount":12}
  [skipped] 002-add-mobile-features
```

On failure, the run stops at that migration, prints `Failed: <name>` with
the error, and exits non-zero - nothing after it runs.

## How migration history is tracked

Every successful run inserts one document into a `migrations` collection:

```js
{ name: "001-add-notification-field", executedAt: ISODate("...") }
```

`name` is unique, so the same migration file can never be recorded (and
therefore never re-run) twice, even if two `npm run migrate` invocations
somehow overlap.

## Best practices

- **Idempotent by construction.** Filter on the condition you're fixing
  (`{ field: { $exists: false } }`, `{ status: { $exists: false } }`,
  etc.), not on "all documents" - then re-running a migration that already
  succeeded matches nothing and is a safe no-op. The runner's own history
  check is a second, independent safety net, not a replacement for this.
- **Never overwrite existing values.** These migrations backfill missing
  data; they should never clobber a value someone already set (including a
  deliberately-empty one like `features: []`).
- **Use bulk operations** (`updateMany`, `bulkWrite`) instead of
  fetch-then-loop-then-save. It's faster, and each individual document
  update is atomic on its own regardless of whether you're using a
  transaction.
- **Never edit or renumber a migration that has already run** against any
  shared environment. If you got it wrong, write a new migration that
  corrects it - editing history that other environments have already
  executed just means environments silently disagree on what state they're
  in.
- **Keep each migration focused on one change.** Small, single-purpose
  migrations are easier to reason about, easier to review, and - if
  something does go wrong - much easier to know exactly what needs fixing.
- **Don't call this from application code / startup.** Migrations run only
  via `npm run migrate`, by a human (or CI/CD step) who decided it's time -
  never automatically when the app boots.
