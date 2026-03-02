import { logger } from '@/utils/logger';
import {
  updateBulk,
  updateChurchStatus,
  updateChurchAddress,
  updateChurchContact,
  updateFeatures
} from '../../../services/churchService';
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { getUserSession } from '../../../../utils/generateToken';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUD_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUD_SECRETE
});

export const config = {
  api: { bodyParser: false }
};

export const PUT = async (req) => {
  try {
    const url = new URL(req.url);
    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const action = url.searchParams.get('action');

    if (action === 'bulk') {
      const body = await req.json();
      const updated = await updateBulk(user?.church, body);
      return NextResponse.json({ success: true, data:updated });
    }

    if (action === 'one') {
      let result = null;
      const formData = await req.formData();

      const name = formData.get('name');
      const email = formData.get('email');
      const mobile = formData.get('mobile');
      const description = formData.get('description');
      const file = formData.get('file');

      if (file) {
        const fileBuffer = await file.arrayBuffer();
        const base64Data = Buffer.from(fileBuffer).toString('base64');
        const fileUri = `data:${file.type};base64,${base64Data}`;

        try {
          const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
              cloudinary.uploader
                .upload(fileUri, {
                  folder: `${process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_FOLDER}/${user?.church}`,
                  resource_type: 'auto',
                  invalidate: true
                })
                .then((result) => resolve(result))
                .catch((error) => reject(error));
            });
          };

          result = await uploadToCloudinary();
        } catch (error) {
          logger.error(error);
        }
      }

      const body = {
        description,
        name,
        email,
        mobile
      };

      if (result) {
        body.public_id = result.public_id;
        body.secure_url = result.secure_url;
      }

      const updated = await updateBulk(user?.church, body);
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'status') {
      const body = await req.json();
      const stripeCustomerId = url.searchParams.get('stripeCustomerId');
      const updated = await updateChurchStatus(stripeCustomerId, body);
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'address') {
      const body = await req.json();
      const updated = await updateChurchAddress(user?.church, body);
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'contact') {
      const body = await req.json();
      const updated = await updateChurchContact(user?.church, body);
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'features') {
      const body = await req.json();
      const updated = await updateFeatures(user?.church, body);
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
