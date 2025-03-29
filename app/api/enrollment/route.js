import { enrollStudent, getEnrollmentsByStudent, getEnrolledStudents, updateProgress, unenrollStudent } from "@/services/enrollmentService";
import dbConnect from "@/lib/dbConnect";

export const GET = async (req) => {
  await dbConnect();

  const url = new URL(req.url);
  const studentId = url.searchParams.get("studentId");
  const courseId = url.searchParams.get("courseId");

  if (studentId) {
    // Fetch all enrollments for a student
    const response = await getEnrollmentsByStudent(studentId);
    if (!response.success) return Response.json({ error: response.error }, { status: 400 });
    return Response.json({ enrollments: response.enrollments }, { status: 200 });
  } else if (courseId) {
    // Fetch all enrolled students in a course
    const response = await getEnrolledStudents(courseId);
    if (!response.success) return Response.json({ error: response.error }, { status: 400 });
    return Response.json({ students: response.enrollments }, { status: 200 });
  } else {
    return Response.json({ error: "Provide a valid studentId or courseId" }, { status: 400 });
  }
};

export const POST = async (req) => {
  await dbConnect();
  const { student, course } = await req.json();

  const response = await enrollStudent(student, course);
  if (!response.success) return Response.json({ error: response.error }, { status: 400 });

  return Response.json({ message: "Enrollment successful", enrollment: response.enrollment }, { status: 201 });
};

export const PUT = async (req) => {
  await dbConnect();
  const { student, course, lesson } = await req.json();

  const response = await updateProgress(student, course, lesson);
  if (!response.success) return Response.json({ error: response.error }, { status: 400 });

  return Response.json({ message: "Progress updated", progress: response.progress }, { status: 200 });
};

export const DELETE = async (req) => {
  await dbConnect();
  const { student, course } = await req.json();

  const response = await unenrollStudent(student, course);
  if (!response.success) return Response.json({ error: response.error }, { status: 400 });

  return Response.json({ message: response.message }, { status: 200 });
};
