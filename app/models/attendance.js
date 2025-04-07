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

AttendanceSchema.createIndex(
  { service: 1, memberId: 1, church :1},
  { unique: true, partialFilterExpression: { memberId: { $exists: true } } }
);

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
export default Attendance;
