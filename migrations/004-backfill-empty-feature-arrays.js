import Church from '../app/models/church';
import { DEFAULT_ENABLED_FEATURE_IDS } from '../constants/mobileFeatures';

/**
 * Catch-up migration for environments where 003-default-mobile-features
 * already ran under its original filter (missing/null only) and therefore
 * left every church sitting on `features: []` untouched - that filter has
 * since been corrected in 003's source, but 003 itself can't be re-run
 * (it's already recorded in the `migrations` history collection; see
 * migrations/README.md - migrations only ever run once, and are never
 * edited to change already-applied behavior on a shared database).
 *
 * Same filter and same backfill value as the corrected 003. On a
 * completely fresh environment (003 not yet run there) this is a no-op:
 * 003 itself already catches everything, so 004 matches nothing.
 *
 * Idempotent: re-running this after it has succeeded matches zero
 * documents. Churches with one or more actual feature ids already set
 * (`features` neither missing, null, nor empty) are left untouched.
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
