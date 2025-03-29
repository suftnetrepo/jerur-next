const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, default: 0.0 },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  isPublished: { type: Boolean, default: false },
  thumbnail: String,
  sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
  createdAt: { type: Date, default: Date.now },
});

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
export default Course;