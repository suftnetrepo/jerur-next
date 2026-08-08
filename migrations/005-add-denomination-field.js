import Church from '../app/models/church';

/**
 * Adds the `denomination` field (empty string) to every Church document
 * that doesn't already have one.
 *
 * Idempotent: only matches documents missing the field entirely, so it
 * never overwrites a church's existing `denomination` selection - Church
 * admins set this from Settings -> About Us; this migration deliberately
 * does not guess a value for anyone.
 */
export default async function migrate(session) {
  const result = await Church.updateMany(
    { denomination: { $exists: false } },
    { $set: { denomination: '' } },
    { session }
  );

  return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
}
