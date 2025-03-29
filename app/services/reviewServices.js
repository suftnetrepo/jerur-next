const Review = require("../models/review");

// Create a review
const createReview = async (studentId, courseId, rating, comment) => {
  try {
    // Check if student has already reviewed the course
    const existingReview = await Review.findOne({ student: studentId, course: courseId });
    if (existingReview) return { success: false, error: "You have already reviewed this course" };

    const newReview = new Review({ student: studentId, course: courseId, rating, comment });
    await newReview.save();

    return { success: true, review: newReview };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get all reviews for a course
const getReviewsByCourse = async (courseId) => {
  try {
    const reviews = await Review.find({ course: courseId }).populate("student");
    return { success: true, reviews };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get all reviews by a student
const getReviewsByStudent = async (studentId) => {
  try {
    const reviews = await Review.find({ student: studentId }).populate("course");
    return { success: true, reviews };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export  {
  createReview,
  getReviewsByCourse,
  getReviewsByStudent,
};
