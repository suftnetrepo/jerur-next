import Church from '../app/models/church';

/**
 * Backfills the two new Church fields intended for the mobile app's
 * church banner/hero area (see app/models/church.js):
 *   short_message = ""
 *   verse         = ""
 *
 * Run as two independent updateMany calls, each gated on its own field's
 * existence, rather than one combined $set - so a document missing only
 * one of the two (shouldn't happen in practice, since both are introduced
 * together by this migration, but is possible in principle) only gets the
 * missing field backfilled. Never overwrites a value that's already there,
 * including an existing "" that was deliberately saved.
 *
 * Idempotent: after the first run every church has both fields, so a
 * second run's $exists:false filters match nothing.
 */
export default async function migrate(session) {
  const totalCount = await Church.countDocuments({}, { session });

  const shortMessageResult = await Church.updateMany(
    { short_message: { $exists: false } },
    { $set: { short_message: '' } },
    { session }
  );

  const verseResult = await Church.updateMany(
    { verse: { $exists: false } },
    { $set: { verse: '' } },
    { session }
  );

  // Both fields are introduced together, so in practice these two results
  // match the same set of documents - matchedCount/modifiedCount below
  // report that combined figure, with the per-field breakdown kept in
  // `details` for transparency in case they ever do diverge.
  const matchedCount = Math.max(shortMessageResult.matchedCount, verseResult.matchedCount);
  const modifiedCount = Math.max(shortMessageResult.modifiedCount, verseResult.modifiedCount);

  return {
    matchedCount,
    modifiedCount,
    skippedCount: totalCount - matchedCount,
    details: {
      short_message: { matchedCount: shortMessageResult.matchedCount, modifiedCount: shortMessageResult.modifiedCount },
      verse: { matchedCount: verseResult.matchedCount, modifiedCount: verseResult.modifiedCount }
    }
  };
}
