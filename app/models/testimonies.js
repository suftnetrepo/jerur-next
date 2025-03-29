import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const testimoniesSchema = new Schema(
  {
    church: { type: Schema.Types.ObjectId, index: true, ref: 'Church', required: true },
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
    description: {
      type: String,
      trim: true,
      required: false,
      max: 1000
    },
    status: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)
testimoniesSchema.index({ church: -1 });
const Testimonies = mongoose.models.Testimonies || mongoose.model('Testimonies', testimoniesSchema);
export default Testimonies;
