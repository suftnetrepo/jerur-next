export const config = {
  api: { bodyParser: false }
};

// Pulls the plain fields + the raw image File (if any) off the multipart
// form. Uploading to Cloudinary is the slider service's job (only it knows
// whether this is a new slider or an edit, and - for edits - what the
// previous image's public_id was), so this stays a pure parser.
export async function parseSliderFormData(req) {
  const formData = await req.formData();

  const title = formData.get('title');
  const status = formData.get('status') === 'true';
  const imageOnly = formData.get('imageOnly') === 'true';
  const message = formData.get('message');
  const file = formData.get('file');

  return {
    title,
    status,
    message,
    imageOnly,
    // Present only when the admin actually picked a new image; the service
    // layer treats a missing/falsy `file` as "keep the existing image".
    file: file || null
  };
}
