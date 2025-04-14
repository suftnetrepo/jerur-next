import { Buffer } from 'buffer';
import { v2 as cloudinary } from 'cloudinary';

export const config = {
    api: { bodyParser: false }
  };
  
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUD_API_KEY,
    api_secret: process.env.NEXT_PUBLIC_CLOUD_SECRETE
  });

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
  let uploadedImage = null;

  if (file) {
    const fileBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(fileBuffer).toString('base64');
    const fileUri = `data:${file.type};base64,${base64Data}`;

    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload(fileUri, {
            folder: 'jerur_next_uploads',
            resource_type: 'auto',
            invalidate: true
          })
          .then(resolve)
          .catch(reject);
      });
    };

    uploadedImage = await uploadToCloudinary();
  }

  const eventData = {
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
    location
  };

  if (uploadedImage) {
    eventData.secure_url = uploadedImage.secure_url;
    eventData.public_id = uploadedImage.public_id;
  }

  return eventData;
}
