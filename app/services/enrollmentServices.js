const Enrollment = require("../models/enrollment");
const Course = require("../models/course");

// Enroll a student in a course
const enrollStudent = async (studentId, courseId) => {
  try {
    // Check if the student is already enrolled
    const existingEnrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (existingEnrollment) return { success: false, error: "Student is already enrolled in this course" };

    const newEnrollment = new Enrollment({ student: studentId, course: courseId });
    await newEnrollment.save();

    return { success: true, enrollment: newEnrollment };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get all enrollments for a student
const getEnrollmentsByStudent = async (studentId) => {
  try {
    const enrollments = await Enrollment.find({ student: studentId }).populate("course");
    return { success: true, enrollments };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get enrolled students for a course
const getEnrolledStudents = async (courseId) => {
  try {
    const enrollments = await Enrollment.find({ course: courseId }).populate("student");
    return { success: true, enrollments };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Track student progress in a course
const updateProgress = async (studentId, courseId, lessonId) => {
  try {
    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (!enrollment) return { success: false, error: "Enrollment not found" };

    // Avoid duplicate lesson completion
    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
      
      // Calculate new progress percentage
      const course = await Course.findById(courseId).populate("sections");
      const totalLessons = course.sections.reduce((sum, section) => sum + section.lessons.length, 0);
      enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);
      
      await enrollment.save();
    }

    return { success: true, progress: enrollment.progress };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Unenroll a student from a course
const unenrollStudent = async (studentId, courseId) => {
  try {
    const enrollment = await Enrollment.findOneAndDelete({ student: studentId, course: courseId });
    if (!enrollment) return { success: false, error: "Enrollment not found" };

    return { success: true, message: "Successfully unenrolled from the course" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export  {
  enrollStudent,
  getEnrollmentsByStudent,
  getEnrolledStudents,
  updateProgress,
  unenrollStudent,
};
