import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const EventSchema = new mongoose.Schema(
  {
    suid: { type: Schema.Types.ObjectId, ref: 'Church', required: true },
    title: {
      type: String,
      trim: true,
      required: true,
      max: 100
    },
    start_date: {
      type: Date,
      required: true
    },
    end_date: {
      type: Date,
      trim: false,
      required: true
    },
    secure_url: {
      type: String,
      required: false,
      default: ''
    },
    public_id: {
      type: String,
      required: false,
      default: ''
    },
    description: {
      type: String,
      trim: true,
      required: false,
      max: 250
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
      max: 255
    },
    county: {
      type: String,
      required: false,
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
      default: false
    },
    can_register: {
      type: Boolean,
      default: false
    },
    agenda: [
      {
        title: {
          type: String,
          trim: true,
          required: true,
          max: 100
        },
        start_time: {
          type: String,
          trim: false,
          required: true,
          max: 10
        },
        end_time: {
          type: String,
          trim: false,
          required: true,
          max: 10
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
        },
        sequency_no: {
          type: Number,
          default: 0
        },
        facilitator: {
          type: String,
          trim: false,
          required: false,
          max: 10
        }
      }
    ],
    register: [
      {
        first_name: {
          type: String,
          trim: true,
          required: false
        },
        last_name: {
          type: String,
          trim: true,
          required: false
        },
        mobile: {
          type: String,
          trim: true,
          required: false,
          default: ''
        },
        email: { type: String, lowercase: true }
      }
    ]
  },
  { timestamps: true }
)

const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
export default Event;
