import Church from '../app/models/church';
import { DEFAULT_ENABLED_FEATURE_IDS } from '../constants/mobileFeatures';

/**
 * Backfills `features` with DEFAULT_ENABLED_FEATURE_IDS on Church
 * documents that have no configured selection yet - the field is missing
 * entirely, explicitly null, or an empty array.
 *
 * An empty array counts as "not yet configured" rather than "deliberately
 * set to nothing": Mongoose gives array-type schema paths an implicit `[]`
 * default even without one declared, so before Church.features had a real
 * default (see app/models/church.js), every church that had ever been
 * saved already carried `features: []` regardless of whether an admin had
 * actually visited Settings -> Mobile Features. Treating `[]` as
 * "configured" would have permanently locked those churches out of the
 * rollout.
 *
 * Idempotent: the filter only matches documents in one of those three
 * states, so re-running this after it has succeeded matches zero
 * documents. Churches with one or more actual feature ids already set are
 * left untouched; their existing choices are never overwritten.
 *
 * NOTE: this file was edited after already being recorded as executed
 * against the shared dev database (its original filter didn't match
 * `features: []`) - normally migrations are never edited post-execution
 * (see migrations/README.md), but this is a deliberate exception so any
 * *new* environment running migrations from scratch gets the corrected
 * behavior in one step. Environments where 003 already ran under the old
 * filter are caught up by 004-backfill-empty-feature-arrays.js instead,
 * rather than by mutating 003's already-recorded history.
 */
export default async function migrate(session) {
  const filter = { $or: [{ features: { $exists: false } }, { features: null }, { features: { $size: 0 } }] };

  const totalChurches = await Church.countDocuments({}, { session });
  const matchingCount = await Church.countDocuments(filter, { session });

  const result = await Church.updateMany(
    filter,
    { $set: { features: DEFAULT_ENABLED_FEATURE_IDS } },
    { session }
  );

  return {
    totalChurches,
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
    skippedCount: totalChurches - matchingCount
  };
}
