const Lesson = require("../models/lesson");
const Section = require("../models/section");

// Create a new lesson and link it to a section
const createLesson = async (lessonData) => {
  try {
    const newLesson = new Lesson(lessonData);
    await newLesson.save();

    // Update the Section to include the new lesson
    await Section.findByIdAndUpdate(lessonData.section, { $push: { lessons: newLesson._id } });

    return { success: true, lesson: newLesson };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get all lessons in a section
const getLessonsBySection = async (sectionId) => {
  try {
    const lessons = await Lesson.find({ section: sectionId });
    return { success: true, lessons };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get a single lesson by ID
const getLessonById = async (lessonId) => {
  try {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return { success: false, error: "Lesson not found" };
    return { success: true, lesson };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update a lesson
const updateLesson = async (lessonId, updateData) => {
  try {
    const updatedLesson = await Lesson.findByIdAndUpdate(lessonId, updateData, { new: true });
    if (!updatedLesson) return { success: false, error: "Lesson not found" };
    return { success: true, lesson: updatedLesson };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete a lesson and remove it from the section
const deleteLesson = async (lessonId) => {
  try {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return { success: false, error: "Lesson not found" };

    await Section.findByIdAndUpdate(lesson.section, { $pull: { lessons: lessonId } });
    await Lesson.findByIdAndDelete(lessonId);

    return { success: true, message: "Lesson deleted successfully" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export {
  createLesson,
  getLessonsBySection,
  getLessonById,
  updateLesson,
  deleteLesson,
};
