const Payment = require("../models/payment");
const Enrollment = require("../models/enrollment");
const { v4: uuidv4 } = require("uuid");

// Create a payment record (before actual payment processing)
const initiatePayment = async (studentId, courseId, amount) => {
  try {
    const transactionId = uuidv4(); // Generate unique transaction ID

    const newPayment = new Payment({
      student: studentId,
      course: courseId,
      amount,
      transactionId,
      paymentStatus: "pending",
    });

    await newPayment.save();
    return { success: true, payment: newPayment };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Complete a payment (after external payment confirmation)
const completePayment = async (transactionId) => {
  try {
    const payment = await Payment.findOne({ transactionId });
    if (!payment) return { success: false, error: "Payment not found" };

    payment.paymentStatus = "completed";
    await payment.save();

    // Enroll the student in the course after successful payment
    const enrollment = new Enrollment({ student: payment.student, course: payment.course });
    await enrollment.save();

    return { success: true, message: "Payment successful and course enrolled", enrollment };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get all payments by a student
const getPaymentsByStudent = async (studentId) => {
  try {
    const payments = await Payment.find({ student: studentId }).populate("course");
    return { success: true, payments };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get all payments for a course
const getPaymentsByCourse = async (courseId) => {
  try {
    const payments = await Payment.find({ course: courseId }).populate("student");
    return { success: true, payments };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Refund or cancel payment
const refundPayment = async (transactionId) => {
  try {
    const payment = await Payment.findOne({ transactionId });
    if (!payment) return { success: false, error: "Payment not found" };

    if (payment.paymentStatus !== "completed") {
      return { success: false, error: "Payment is not completed, cannot refund" };
    }

    payment.paymentStatus = "failed"; // Mark as refunded
    await payment.save();

    // Remove enrollment if refund is processed
    await Enrollment.findOneAndDelete({ student: payment.student, course: payment.course });

    return { success: true, message: "Refund processed successfully" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export {
  initiatePayment,
  completePayment,
  getPaymentsByStudent,
  getPaymentsByCourse,
  refundPayment,
};
