import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const DonationSchema = new Schema(
  {
    donation_type: { type: String, required: true, max: 20 },
    first_name: {
      type: String,
      trim: true,
      required: false,
    },
    last_name: {
      type: String,
      trim: false,
      required: false,
    },
    email: { type: String, unique: false, lowercase: true },
    amount: { type: Number, required: true },
    date_donated: { type: Date, required: true },
    online: { type: Boolean, default: false },
    suid: { type: Schema.Types.ObjectId, ref: 'Church', required: true },
  },
  { timestamps: true },
);

const Donation = mongoose.models.Donation || mongoose.model('Donation', DonationSchema);
export default Donation;
