import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const AttendanceSchema = new Schema(
  {
    // Legacy fields (preserved for backward compatibility)
    service: { type: Schema.Types.ObjectId, ref: 'ServiceTime', required: false },
    count: { type: Number, required: false },
    church: { type: Schema.Types.ObjectId, ref: 'Church', required: false },
    checkInTime: { type: Date, required: false },
    
    // New fields
    serviceId: { type: Schema.Types.ObjectId, ref: 'ServiceTime', required: false },
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: false },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    
    status: {
      type: String,
      enum: [
        'PRESENT_IN_CHURCH',
        'JOINED_ONLINE',
        'ABSENT',
        'SICK',
        'TRAVELLING',
        'WORKING',
        'FAMILY_COMMITMENT',
        'NEEDS_PRAYER',
        'OTHER'
      ],
      required: false
    },
    
    message: { type: String, required: false },
    
    checkedInVia: {
      type: String,
      enum: ['QR_CODE', 'MANUAL', 'ONLINE'],
      required: false
    },
    
    wantsPastorContact: { type: Boolean, default: false },
    
    submittedAt: { type: Date, required: false }
  },
  { timestamps: true },
);

// Unique index on (userId, serviceId) - A member can submit attendance only once per service
AttendanceSchema.index({ userId: 1, serviceId: 1 }, { sparse: true });
AttendanceSchema.index({ memberId: 1, serviceId: 1 }, { sparse: true });
AttendanceSchema.index({ serviceId: 1 });
AttendanceSchema.index({ memberId: 1 });
AttendanceSchema.index({ userId: 1 });
AttendanceSchema.index({ church: 1 });
AttendanceSchema.index({ status: 1 });
AttendanceSchema.index({ createdAt: 1 });

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
export default Attendance;
