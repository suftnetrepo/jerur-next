import Attendance from '../app/models/attendance';

/**
 * Backfills the derived total without inventing historical gender or age
 * data. The optional household object is populated only by new submissions.
 */
export default async function migrate(session) {
  const filter = { totalAttendance: { $exists: false } };

  const [matchedCount, totalCount] = await Promise.all([
    Attendance.countDocuments(filter, { session }),
    Attendance.countDocuments({}, { session })
  ]);

  const result = await Attendance.updateMany(
    filter,
    [
      {
        $set: {
          totalAttendance: {
            $ifNull: [
              '$totalAttendance',
              {
                $cond: [
                  { $in: ['$status', ['PRESENT_IN_CHURCH', 'JOINED_ONLINE']] },
                  { $ifNull: ['$count', 1] },
                  {
                    $cond: [
                      { $eq: [{ $type: '$status' }, 'missing'] },
                      { $ifNull: ['$count', 0] },
                      0
                    ]
                  }
                ]
              }
            ]
          }
        }
      }
    ],
    session ? { session } : {}
  );

  return {
    matchedCount,
    modifiedCount: result.modifiedCount,
    skippedCount: Math.max(totalCount - matchedCount, 0)
  };
}
