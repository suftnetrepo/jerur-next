import Church from '../app/models/church';

/**
 * Adds the `features` field (an empty array) to every Church document that
 * doesn't already have one.
 *
 * Idempotent: only matches documents missing the field entirely, so it
 * never overwrites a church's existing `features` selection - including an
 * existing empty array, which already satisfies "has the field".
 */
export default async function migrate(session) {
  const result = await Church.updateMany(
    { features: { $exists: false } },
    { $set: { features: [] } },
    { session }
  );

  return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
}
