import { issueCertificate, getCertificatesByStudent, getCertificatesByCourse } from "@/services/certificateService";
import dbConnect from "@/lib/dbConnect";

export const GET = async (req) => {
  await dbConnect();

  const url = new URL(req.url);
  const studentId = url.searchParams.get("studentId");
  const courseId = url.searchParams.get("courseId");

  if (studentId) {
    // Fetch all certificates for a student
    const response = await getCertificatesByStudent(studentId);
    if (!response.success) return Response.json({ error: response.error }, { status: 400 });
    return Response.json({ certificates: response.certificates }, { status: 200 });
  } else if (courseId) {
    // Fetch all certificates issued for a course
    const response = await getCertificatesByCourse(courseId);
    if (!response.success) return Response.json({ error: response.error }, { status: 400 });
    return Response.json({ certificates: response.certificates }, { status: 200 });
  } else {
    return Response.json({ error: "Provide a valid studentId or courseId" }, { status: 400 });
  }
};

export const POST = async (req) => {
  await dbConnect();
  const { student, course, certificateUrl } = await req.json();

  const response = await issueCertificate(student, course, certificateUrl);
  if (!response.success) return Response.json({ error: response.error }, { status: 400 });

  return Response.json({ message: "Certificate issued successfully", certificate: response.certificate }, { status: 201 });
};
