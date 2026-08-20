import Church from '../app/models/church';

/**
 * Renames Church.prayer_request_email -> Church.support_email. The field
 * is being repurposed: it now backs the general "support" address the
 * mobile app uses when sending Testimony, Contact Us, and Wofbi course
 * enquiry email drafts (previously all three fell back to the church's
 * general Church.email) - see app/models/church.js.
 *
 * Only copies a value across for churches that had actually set
 * prayer_request_email and don't already have support_email - never
 * overwrites an existing support_email, and matches nothing for churches
 * with no prayer_request_email (or an empty one) to carry over.
 * Idempotent: once support_email exists, a church no longer matches the
 * filter, so re-running this migration is a safe no-op.
 *
 * The old prayer_request_email key is left in place on the raw document
 * afterward rather than $unset - it's no longer declared on the Church
 * schema (so Mongoose never reads or writes it again) and orphaned data
 * is harmless in MongoDB's schemaless storage, but leaving it means this
 * migration can't destroy data if anything still needs to reference it
 * during rollout.
 */
export default async function migrate(session) {
  const result = await Church.updateMany(
    {
      prayer_request_email: { $exists: true, $nin: ['', null] },
      support_email: { $exists: false }
    },
    [{ $set: { support_email: '$prayer_request_email' } }],
    { session }
  );

  return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
}
