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

export async function parseSliderFormData(req) {
  const formData = await req.formData();

  const title = formData.get('title');
  const status = formData.get('status') === 'true';
  const imageOnly = formData.get('imageOnly') === 'true';
  const message = formData.get('message');

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

  const sliderData = {
    title,
    status,
    message,
    imageOnly
  };

  if (uploadedImage) {
    sliderData.secure_url = uploadedImage.secure_url;
    sliderData.public_id = uploadedImage.public_id;
  }

  return sliderData;
}
