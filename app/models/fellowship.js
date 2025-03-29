import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const FellowshipSchema = new Schema(
  {
    name: {
      type: String,
      default: '',
      max: 50
    },
    addressLine1: {
      type: String,
      required: false,
      default: '',
      max: 100
    },
    completeAddress: {
      type: String,
      required: false,
      default: '',
      max: 255
    },
    county: {
      type: String,
      default: '',
      max: 50
    },
    town: {
      type: String,
      required: false,
      max: 20
    },
    country: {
      type: String,
      required: false,
      max: 20
    },
    postcode: {
      type: String,
      required: false,
      default: '',
      max: 20
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: false
      },
      coordinates: {
        type: [Number],
        required: false
      }
    },
    status: {
      type: Boolean,
      required: false,
      default: false
    },
    mobile: {
      type: String,
      trim: false,
      required: false,
      max: 50,
      default: ''
    },
    suid: { type: Schema.Types.ObjectId, ref: 'Church', required: true }
  },
	{ timestamps: true }
)

FellowshipSchema.index({ location: '2dsphere' })
const Fellowship = mongoose.models.Fellowship || mongoose.model('Fellowship', FellowshipSchema);
export default Fellowship;
