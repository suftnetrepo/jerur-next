import Church from '../app/models/church';
import { DEFAULT_MOBILE_THEME_ID } from '../constants/mobileThemes';

export default async function migrate(session) {
  const filter = { theme_id: { $exists: false } };
  const [result, totalCount] = await Promise.all([
    Church.updateMany(
      filter,
      { $set: { theme_id: DEFAULT_MOBILE_THEME_ID } },
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
