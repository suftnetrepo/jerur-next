export const config = {
  api: { bodyParser: false }
};

// Pulls the plain fields + the raw hero image File (if any) off the
// multipart form. Uploading that file to Cloudinary is articleService's
// job (it's the only layer that knows whether this is a create or an
// edit, and - for edits - what the previous image's public_id was), so
// this stays a pure parser with no Cloudinary/network calls of its own.
// Same split as parseEventFormData.js / parseSliderFormData.js.
export async function parseArticleFormData(req) {
  const formData = await req.formData();

  const title = formData.get('title');
  const summary = formData.get('summary');
  const content = formData.get('content');
  const status = formData.get('status');
  const file = formData.get('file');

  return {
    title,
    summary,
    content,
    status: status || undefined,
    // Present only when the admin actually picked a new image; the
    // service layer treats a missing/falsy `file` as "keep the existing
    // image".
    file: file || null
  };
}
