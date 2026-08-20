import Church from '../app/models/church';

/**
 * Adds 'bible' and 'hymns' to DEFAULT_ENABLED_FEATURE_IDS (see
 * constants/mobileFeatures.js) - both already have full mobile screens and
 * are meant to be on by default the same as service-times, giving, etc.
 * That constant only governs the Church schema's `features` default and
 * therefore new churches going forward; this migration backfills every
 * existing church so Bible and Hymns show up for them too, without
 * touching any feature id a church has deliberately left disabled.
 *
 * $addToSet only ever adds an id that's missing - it never removes one, so
 * a church that already turned Bible or Hymns off (or on) is left exactly
 * as an admin set it. Naturally idempotent: re-running this after it has
 * succeeded matches zero real changes (the ids are already present).
 */
export default async function migrate(session) {
  const totalChurches = await Church.countDocuments({}, { session });

  const result = await Church.updateMany(
    {},
    { $addToSet: { features: { $each: ['bible', 'hymns'] } } },
    { session }
  );

  return {
    totalChurches,
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount
  };
}
