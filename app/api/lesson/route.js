import { createLesson, getLessonsBySection, getLessonById, updateLesson, deleteLesson } from "@/services/lessonService";
import dbConnect from "@/lib/dbConnect";

export const GET = async (req) => {
  await dbConnect();

  const url = new URL(req.url);
  const lessonId = url.searchParams.get("id");
  const sectionId = url.searchParams.get("sectionId");

  if (lessonId) {
    // Fetch a single lesson by ID
    const response = await getLessonById(lessonId);
    if (!response.success) return Response.json({ error: response.error }, { status: 404 });
    return Response.json(response.lesson, { status: 200 });
  } else if (sectionId) {
    // Fetch all lessons for a section
    const response = await getLessonsBySection(sectionId);
    if (!response.success) return Response.json({ error: response.error }, { status: 400 });
    return Response.json({ lessons: response.lessons }, { status: 200 });
  } else {
    return Response.json({ error: "Provide a valid lessonId or sectionId" }, { status: 400 });
  }
};

export const POST = async (req) => {
  await dbConnect();
  const { section, title, videoUrl, content, position } = await req.json();

  const response = await createLesson({ section, title, videoUrl, content, position });
  if (!response.success) return Response.json({ error: response.error }, { status: 400 });

  return Response.json({ message: "Lesson created successfully", lesson: response.lesson }, { status: 201 });
};

export const PUT = async (req) => {
  await dbConnect();
  const { id, updateData } = await req.json();

  const response = await updateLesson(id, updateData);
  if (!response.success) return Response.json({ error: response.error }, { status: 400 });

  return Response.json({ message: "Lesson updated successfully", lesson: response.lesson }, { status: 200 });
};

export const DELETE = async (req) => {
  await dbConnect();
  const { id } = await req.json();

  const response = await deleteLesson(id);
  if (!response.success) return Response.json({ error: response.error }, { status: 400 });

  return Response.json({ message: response.message }, { status: 200 });
};
