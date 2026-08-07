import Church from '../app/models/church';

/**
 * Adds the `notification` field to every Church document that doesn't
 * already have one, defaulting to an empty/unset notification.
 *
 * Idempotent: the filter only matches documents missing the field, so
 * re-running this after it has succeeded matches zero documents and is a
 * no-op. Churches that already have a `notification` value (including one
 * that was later cleared back to the same shape) are left untouched.
 */
export default async function migrate(session) {
  const result = await Church.updateMany(
    { notification: { $exists: false } },
    {
      $set: {
        notification: {
          title: '',
          message: '',
          expiry_date: null
        }
      }
    },
    { session }
  );

  return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
}
