import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const CampaignSchema = new Schema({
  suid: { type: Schema.Types.ObjectId, ref: 'Church', required: true },
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
  contribution:[
    {
      amount: { type: Number, required: true },
      first_name: {
        type: String,
        trim: true,
        required: true,
      },
      last_name: {
        type: String,
        trim: true,
        required: true,
      },
      email: {
        type: String,
        trim: false,
        required: false,
        default: '',
      },
    }
  ]
}, { timestamps: true });

const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);
export default Campaign;
