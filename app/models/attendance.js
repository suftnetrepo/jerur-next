import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const AttendanceSchema = new Schema(
  {
    service: { type: Schema.Types.ObjectId, ref: 'ServiceTime', required: true },
    memberId: { type: String, required: true },
    church: { type: Schema.Types.ObjectId, ref: 'Church', required: true },
    checkInTime: { type: Date, required: true },
  },
  { timestamps: true },
);

AttendanceSchema.index(
  { church: 1 },
);

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
export default Attendance;
