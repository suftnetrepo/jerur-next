import { createSection, getSectionsByCourse, getSectionById, updateSection, deleteSection } from "@/services/sectionService";
import dbConnect from "@/lib/dbConnect";

export const GET = async (req) => {
  await dbConnect();

  const url = new URL(req.url);
  const sectionId = url.searchParams.get("id");
  const courseId = url.searchParams.get("courseId");

  if (sectionId) {
    // Fetch a single section by ID
    const response = await getSectionById(sectionId);
    if (!response.success) return Response.json({ error: response.error }, { status: 404 });
    return Response.json(response.section, { status: 200 });
  } else if (courseId) {
    // Fetch all sections for a course
    const response = await getSectionsByCourse(courseId);
    if (!response.success) return Response.json({ error: response.error }, { status: 400 });
    return Response.json({ sections: response.sections }, { status: 200 });
  } else {
    return Response.json({ error: "Provide a valid sectionId or courseId" }, { status: 400 });
  }
};

export const POST = async (req) => {
  await dbConnect();
  const { course, title, position } = await req.json();

  const response = await createSection({ course, title, position });
  if (!response.success) return Response.json({ error: response.error }, { status: 400 });

  return Response.json({ message: "Section created successfully", section: response.section }, { status: 201 });
};

export const PUT = async (req) => {
  await dbConnect();
  const { id, updateData } = await req.json();

  const response = await updateSection(id, updateData);
  if (!response.success) return Response.json({ error: response.error }, { status: 400 });

  return Response.json({ message: "Section updated successfully", section: response.section }, { status: 200 });
};

export const DELETE = async (req) => {
  await dbConnect();
  const { id } = await req.json();

  const response = await deleteSection(id);
  if (!response.success) return Response.json({ error: response.error }, { status: 400 });

  return Response.json({ message: response.message }, { status: 200 });
};
