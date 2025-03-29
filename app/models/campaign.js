import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const CampaignSchema = new Schema({
  title: { type: String, required: true, max: 200 },
  description: { type: String, required: true, max: 1000 },
  target_amount: { type: Number, required: true },
  current_amount_funded: { type: Number, default: 0 },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  status: { type: Boolean, default: false },
  secure_url: {
    type: String,
    required: false,
    default: '',
  },
  public_id: {
    type: String,
    required: false,
    default: '',
  },
  suid: { type: Schema.Types.ObjectId, ref: 'Church', required: true },
}, { timestamps: true });

const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);
export default Campaign;
