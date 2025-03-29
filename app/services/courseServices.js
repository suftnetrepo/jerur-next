const Course = require("../models/course");

const createCourse = async (courseData) => {
  try {
    const newCourse = new Course(courseData);
    await newCourse.save();
    return { success: true, course: newCourse };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getAllCourses = async () => {
  try {
    const courses = await Course.find().populate("instructor category sections");
    return { success: true, courses };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getCourseById = async (courseId) => {
  try {
    const course = await Course.findById(courseId).populate("instructor category sections");
    if (!course) return { success: false, error: "Course not found" };
    return { success: true, course };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getCoursesByInstructor = async (instructorId) => {
  try {
    const courses = await Course.find({ instructor: instructorId }).populate("category sections");
    return { success: true, courses };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateCourse = async (courseId, updateData) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(courseId, updateData, { new: true })
      .populate("instructor category sections");
    
    if (!updatedCourse) return { success: false, error: "Course not found" };
    
    return { success: true, course: updatedCourse };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const deleteCourse = async (courseId) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(courseId);
    if (!deletedCourse) return { success: false, error: "Course not found" };
    return { success: true, message: "Course deleted successfully" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const publishCourse = async (courseId) => {
  try {
    const course = await Course.findByIdAndUpdate(courseId, { isPublished: true }, { new: true });
    if (!course) return { success: false, error: "Course not found" };
    return { success: true, course };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export  {
  createCourse,
  getAllCourses,
  getCourseById,
  getCoursesByInstructor,
  updateCourse,
  deleteCourse,
  publishCourse,
};
