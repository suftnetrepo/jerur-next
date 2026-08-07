export const config = {
  api: { bodyParser: false }
};

// Pulls the plain fields + the raw image File (if any) off the multipart
// form. Uploading that file to Cloudinary is the event service's job (it's
// the only layer that knows whether this is a create or an edit, and - for
// edits - what the previous image's public_id was), so this stays a pure
// parser with no Cloudinary/network calls of its own.
export async function parseEventFormData(req) {
  const formData = await req.formData();

  const title = formData.get('title');
  const status = formData.get('status') === 'true';
  const description = formData.get('description');
  const start_date = formData.get('start_date');
  const end_date = formData.get('end_date');
  const addressLine1 = formData.get('addressLine1');
  const county = formData.get('county');
  const town = formData.get('town');
  const country = formData.get('country');
  const postcode = formData.get('postcode');
  const completeAddress = formData.get('completeAddress');

  let location;
  try {
    location = JSON.parse(formData.get('location'));
  } catch (err) {
    throw new Error('Invalid location object');
  }

  const file = formData.get('file');

  return {
    title,
    status,
    description,
    start_date,
    end_date,
    addressLine1,
    county,
    town,
    country,
    postcode,
    completeAddress,
    location,
    // Present only when the admin actually picked a new image; the service
    // layer treats a missing/falsy `file` as "keep the existing image".
    file: file || null
  };
}
