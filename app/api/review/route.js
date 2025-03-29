import { createReview, getReviewsByCourse, getReviewsByStudent } from "@/services/reviewService";
import dbConnect from "@/lib/dbConnect";

export const GET = async (req) => {
  await dbConnect();

  const url = new URL(req.url);
  const studentId = url.searchParams.get("studentId");
  const courseId = url.searchParams.get("courseId");

  if (courseId) {
    // Fetch all reviews for a course
    const response = await getReviewsByCourse(courseId);
    if (!response.success) return Response.json({ error: response.error }, { status: 400 });
    return Response.json({ reviews: response.reviews }, { status: 200 });
  } else if (studentId) {
    // Fetch all reviews by a student
    const response = await getReviewsByStudent(studentId);
    if (!response.success) return Response.json({ error: response.error }, { status: 400 });
    return Response.json({ reviews: response.reviews }, { status: 200 });
  } else {
    return Response.json({ error: "Provide a valid courseId or studentId" }, { status: 400 });
  }
};

export const POST = async (req) => {
  await dbConnect();
  const { student, course, rating, comment } = await req.json();

  const response = await createReview(student, course, rating, comment);
  if (!response.success) return Response.json({ error: response.error }, { status: 400 });

  return Response.json({ message: "Review submitted successfully", review: response.review }, { status: 201 });
};
