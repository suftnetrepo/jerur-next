import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const CampaignContributionSchema = new Schema(
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
    campaign: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  },
  { timestamps: true },
);

const CampaignContribution = mongoose.models.CampaignContribution || mongoose.model('CampaignContribution', CampaignContributionSchema);
export default CampaignContribution;
