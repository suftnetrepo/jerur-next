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
    email: { type: String, unique: false, lowercase: true },

    // CHANGED: was `pin: { type: Number, default: 0 }` — a plaintext numeric
    // PIN readable by anyone with database access. Replaced with a bcrypt
    // hash, same treatment as a password, even though it's "just" a short
    // PIN — it's still the only thing gating "act as this member."
    pinHash: { type: String, required: false, select: false },

    // Self-service login-attempt tracking, so member/login can lock out
    // brute-force PIN guesses without needing separate rate-limit infra
    // (Redis, etc.). See services/memberService.js authenticateMember().
    loginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, required: false },

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
