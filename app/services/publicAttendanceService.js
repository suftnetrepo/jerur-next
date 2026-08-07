import Attendance from '../models/attendance';

/**
 * Kept separate from the existing services/attendanceService.js on
 * purpose — that file wasn't included in what was shared, so this writes
 * directly against the Attendance schema rather than guessing at hidden
 * logic in createAttendance()/add(). Worth merging the two once the
 * existing service's internals are visible, if there's overlap worth
 * consolidating.
 */
export async function submitMemberAttendance({ church, memberId, serviceId, status, message, checkedInVia, wantsPastorContact }) {
  if (!serviceId || !status) {
    throw new Error('serviceId and status are required.');
  }

  try {
    const attendance = await Attendance.create({
      church,
      memberId,
      serviceId,
      status,
      message,
      checkedInVia: checkedInVia ?? 'ONLINE',
      wantsPastorContact: Boolean(wantsPastorContact),
      submittedAt: new Date()
    });
    return attendance;
  } catch (error) {
    // The schema's own unique index on (memberId, serviceId) throws
    // E11000 on a duplicate submission — surfaced as a clear message
    // rather than a raw Mongo error.
    if (error.code === 11000) {
      throw new Error('You have already submitted attendance for this service.');
    }
    throw error;
  }
}
