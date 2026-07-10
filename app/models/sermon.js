import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const SermonSchema = new Schema(
  {
    churchId: { type: Schema.Types.ObjectId, ref: 'Church', required: true },
    title: {
      type: String,
      trim: true,
      required: true
    },
    speakerName: {
      type: String,
      trim: true,
      required: true
    },
    serviceId: { type: Schema.Types.ObjectId, ref: 'ServiceTime', required: true },
    summary: {
      type: String,
      trim: true,
      required: false
    },
    media: {
      youtubeUrl: { type: String, required: false, default: '' },
      audioUrl: { type: String, required: false, default: '' },
      videoUrl: { type: String, required: false, default: '' },
      thumbnail: { type: String, required: false, default: '' }
    },
    durationMinutes: {
      type: Number,
      required: false
    },
    preachedAt: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'DRAFT'
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false }
  },
  { timestamps: true }
)

SermonSchema.index({ churchId: 1 })
SermonSchema.index({ serviceId: 1 })
SermonSchema.index({ preachedAt: -1 })
SermonSchema.index({ status: 1 })
SermonSchema.index({ createdBy: 1 })
SermonSchema.index({ title: 'text', speakerName: 'text', summary: 'text' })

const Sermon = mongoose.models.Sermon || mongoose.model('Sermon', SermonSchema)
export default Sermon
