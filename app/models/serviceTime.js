import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const ServiceTimeSchema = new mongoose.Schema(
  {
    suid: { type: Schema.Types.ObjectId, ref: 'Church', required: true },
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
      max: 250
    },
    status: {
      type: Boolean,
      default: false
    },
    remote: {
      type: Boolean,
      default: false
    },
    remote_link: {
      type: String,
      default: ''
    },
    sequency_no: {
      type: Number,
      default: 0
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
    ]
  },
  { timestamps: true }
);

const ServiceTime = mongoose.models.ServiceTime || mongoose.model('ServiceTime', ServiceTimeSchema);
export default ServiceTime;
