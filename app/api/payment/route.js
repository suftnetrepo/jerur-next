import { initiatePayment, completePayment, getPaymentsByStudent, getPaymentsByCourse, refundPayment } from "@/services/paymentService";
import dbConnect from "@/lib/dbConnect";

export const GET = async (req) => {
  await dbConnect();

  const url = new URL(req.url);
  const studentId = url.searchParams.get("studentId");
  const courseId = url.searchParams.get("courseId");

  if (studentId) {
    // Fetch all payments for a student
    const response = await getPaymentsByStudent(studentId);
    if (!response.success) return Response.json({ error: response.error }, { status: 400 });
    return Response.json({ payments: response.payments }, { status: 200 });
  } else if (courseId) {
    // Fetch all payments for a course
    const response = await getPaymentsByCourse(courseId);
    if (!response.success) return Response.json({ error: response.error }, { status: 400 });
    return Response.json({ payments: response.payments }, { status: 200 });
  } else {
    return Response.json({ error: "Provide a valid studentId or courseId" }, { status: 400 });
  }
};

export const POST = async (req) => {
  await dbConnect();
  const { student, course, amount } = await req.json();

  const response = await initiatePayment(student, course, amount);
  if (!response.success) return Response.json({ error: response.error }, { status: 400 });

  return Response.json({ message: "Payment initiated", payment: response.payment }, { status: 201 });
};

export const PUT = async (req) => {
  await dbConnect();
  const { transactionId } = await req.json();

  const response = await completePayment(transactionId);
  if (!response.success) return Response.json({ error: response.error }, { status: 400 });

  return Response.json({ message: "Payment successful", enrollment: response.enrollment }, { status: 200 });
};

export const DELETE = async (req) => {
  await dbConnect();
  const { transactionId } = await req.json();

  const response = await refundPayment(transactionId);
  if (!response.success) return Response.json({ error: response.error }, { status: 400 });

  return Response.json({ message: response.message }, { status: 200 });
};
