const Certificate = require("../models/certificate");
const Enrollment = require("../models/enrollment");

// Issue a certificate when a student completes a course
const issueCertificate = async (studentId, courseId, certificateUrl) => {
  try {
    // Check if the student has completed the course
    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (!enrollment || enrollment.progress < 100) {
      return { success: false, error: "Course not yet completed" };
    }

    // Check if the student already has a certificate
    const existingCertificate = await Certificate.findOne({ student: studentId, course: courseId });
    if (existingCertificate) return { success: false, error: "Certificate already issued" };

    const newCertificate = new Certificate({ student: studentId, course: courseId, certificateUrl });
    await newCertificate.save();

    return { success: true, certificate: newCertificate };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get certificates for a student
const getCertificatesByStudent = async (studentId) => {
  try {
    const certificates = await Certificate.find({ student: studentId }).populate("course");
    return { success: true, certificates };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get certificates issued for a course
const getCertificatesByCourse = async (courseId) => {
  try {
    const certificates = await Certificate.find({ course: courseId }).populate("student");
    return { success: true, certificates };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export {
  issueCertificate,
  getCertificatesByStudent,
  getCertificatesByCourse,
};
