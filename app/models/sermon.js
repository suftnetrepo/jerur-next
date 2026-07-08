import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const SermonSchema = new Schema(
  {
    title: { type: String, required: true },
    preacher: { type: String, required: false },
    scripture: { type: String, required: false },
    description: { type: String, required: false },
    audioUrl: { type: String, required: false },
    videoUrl: { type: String, required: false },
    thumbnailUrl: { type: String, required: false },
    sermonDate: { type: Date, required: false },
    tags: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

SermonSchema.index({ title: 'text', description: 'text', preacher: 'text' });
SermonSchema.index({ createdBy: 1 });
SermonSchema.index({ sermonDate: -1 });
SermonSchema.index({ tags: 1 });
SermonSchema.index({ createdAt: -1 });

const Sermon = mongoose.models.Sermon || mongoose.model('Sermon', SermonSchema);
export default Sermon;
