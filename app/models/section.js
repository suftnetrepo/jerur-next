import mongoose from 'mongoose';

const SectionSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  title: { type: String, required: true },
  position: { type: Number, required: true }
});

const Section = mongoose.models.Section || mongoose.model('Section', SectionSchema);
export default Section;
