import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const AttendanceSchema = new Schema(
  {
    service: { type: Schema.Types.ObjectId, ref: 'ServiceTime', required: true },
    count: { type: Number, required: true },
    church: { type: Schema.Types.ObjectId, ref: 'Church', required: true },
    checkInTime: { type: Date, required: true },
  },
  { timestamps: true },
);

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
export default Attendance;
