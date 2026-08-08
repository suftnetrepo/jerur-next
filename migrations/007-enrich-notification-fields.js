import Church from '../app/models/church';

/**
 * Backfills the new Church.notification fields introduced alongside the
 * rich-content notification system (type/priority/status/start_date -
 * secure_url/public_id are left alone here; an absent value already reads
 * back as '' via buildNotificationResponse in churchService.js, and
 * CloudinaryService.replaceImage treats a missing old public_id as "no
 * previous image" correctly on its own, so there's nothing to backfill).
 *
 * Sets sensible defaults on every church whose notification predates this
 * change:
 *   type       = "announcement"
 *   priority   = "normal"
 *   status     = true
 *   start_date = null
 *
 * Never touches title/message/expiry_date - only the four new fields
 * above, via dot-path $set, which updates just those paths inside the
 * existing notification subdocument rather than replacing it wholesale.
 *
 * Idempotent: gated on `notification.type` not existing yet. Every church
 * gets a `notification.type` the moment this runs (either from this
 * migration or, for anyone created afterward, straight from the schema
 * default), so a second run matches nothing.
 */
export default async function migrate(session) {
  const result = await Church.updateMany(
    { 'notification.type': { $exists: false } },
    {
      $set: {
        'notification.type': 'announcement',
        'notification.priority': 'normal',
        'notification.status': true,
        'notification.start_date': null
      }
    },
    { session }
  );

  return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
}
