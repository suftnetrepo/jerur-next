import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const memberSchema = new Schema(
  {
    church: { type: Schema.Types.ObjectId, ref: 'Church', required: true },
    first_name: {
      type: String,
      trim: true,
      required: true
    },
    last_name: {
      type: String,
      trim: true,
      required: true
    },
    mobile: {
      type: String,
      trim: true,
      required: false,
      default: ''
    },
    status: { type: String, enum: ["active", "provisional", "inactive", "under discipline"], required: true },
    email: { type: String, unique: true, lowercase: true },
    pin: {
      type: Number,
      default: 0
    },
    role: { type: String, enum: ['member', 'volunteer', 'leader', 'pastor'], required: true }
  },
  { timestamps: true }
)

memberSchema.statics.findByEmail = function (email) {
  const user = this.findOne({ email })
  return user
}

const Member = mongoose.models.Member || mongoose.model('Member', memberSchema);
export default Member;
