import Church from '../app/models/church';
import { DENOMINATIONS } from '../constants/denominations';

/**
 * One-time architecture fix: Church.denomination originally stored the
 * display label ("Pentecostal", "Living Faith Church (Winners Chapel)",
 * ...) instead of a stable id - see constants/denominations.js, now
 * updated to a {id, label} catalogue (same pattern as
 * constants/mobileFeatures.js). This migration:
 *
 *  1. Converts any denomination value that's still a known LABEL into its
 *     corresponding id (e.g. "Pentecostal" -> "pentecostal"). Idempotent:
 *     once converted, a church's value is an id, which never matches a
 *     label string, so re-running this a second time matches nothing.
 *
 *  2. For churches with an empty denomination whose name clearly
 *     identifies them as Winners Chapel / Living Faith Church, sets
 *     denomination to "living-faith-church". Deliberately narrow - name
 *     contains "winners chapel" or "living faith", case-insensitive -
 *     rather than guessing any other denomination from a name. Every
 *     other empty value is left untouched. Also idempotent: a church this
 *     matches no longer has an empty denomination afterward, so it won't
 *     match again.
 *
 * Neither step ever touches a church that already has a valid id or a
 * genuinely different (non-empty) denomination.
 */
export default async function migrate(session) {
  const labelToIdOps = DENOMINATIONS.map(({ id, label }) => ({
    updateMany: {
      filter: { denomination: label },
      update: { $set: { denomination: id } }
    }
  }));

  const labelResult = await Church.bulkWrite(labelToIdOps, { session });

  const winnersChapelResult = await Church.updateMany(
    {
      denomination: '',
      name: { $regex: /(winners chapel|living faith)/i }
    },
    { $set: { denomination: 'living-faith-church' } },
    { session }
  );

  return {
    labelsMatched: labelResult.matchedCount,
    labelsConverted: labelResult.modifiedCount,
    winnersChapelMatched: winnersChapelResult.matchedCount,
    winnersChapelUpdated: winnersChapelResult.modifiedCount
  };
}
