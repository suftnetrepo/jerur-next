import mongoose from 'mongoose';
const LessonSchema = new mongoose.Schema({
  section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
  title: { type: String, required: true },
  videoUrl: String,
  content: String,
  position: { type: Number, required: true },
});

const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', LessonSchema);
export default Lesson;

