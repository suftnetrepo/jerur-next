import Church from '../app/models/church';

/**
 * Adds the optional conference link to existing embedded notifications.
 * Dot-path updates preserve every existing notification field and the
 * $exists filter makes this migration safe to rerun.
 */
export default async function migrate(session) {
  const filter = { 'notification.conference_link': { $exists: false } };
  const [result, totalCount] = await Promise.all([
    Church.updateMany(
      filter,
      { $set: { 'notification.conference_link': '' } },
      { session }
    ),
    Church.countDocuments({}, { session })
  ]);

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
    skippedCount: Math.max(0, totalCount - result.matchedCount)
  };
}
