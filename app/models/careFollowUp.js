import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const CareFollowUpSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: false },
    attendanceId: { type: Schema.Types.ObjectId, ref: 'Attendance', required: false },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    
    reason: {
      type: String,
      enum: ['SICK', 'NEEDS_PRAYER', 'ABSENT', 'BEREAVEMENT', 'OTHER'],
      required: true
    },
    
    note: { type: String, required: false },

    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM'
    },
    
    status: {
      type: String,
      enum: ['OPEN', 'CONTACTED', 'VISITED', 'CLOSED'],
      default: 'OPEN'
    }
  },
  { timestamps: true }
);

CareFollowUpSchema.index({ userId: 1 });
CareFollowUpSchema.index({ memberId: 1 });
CareFollowUpSchema.index({ status: 1 });
CareFollowUpSchema.index({ assignedTo: 1 });
CareFollowUpSchema.index({ attendanceId: 1 });
CareFollowUpSchema.index({ createdAt: -1 });
CareFollowUpSchema.index({ reason: 1, status: 1 });

const CareFollowUp = mongoose.models.CareFollowUp || mongoose.model('CareFollowUp', CareFollowUpSchema);
export default CareFollowUp;
