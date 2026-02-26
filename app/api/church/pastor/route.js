import { logger } from '@/utils/logger';
import {
    updatePastor
} from '../../../services/churchService';
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { getUserSession } from '@/utils/generateToken';

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
        const user = await getUserSession(req);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let result = null;
        const formData = await req.formData();

        const title = formData.get('title');
        const first_name = formData.get('first_name');
        const last_name = formData.get('last_name');
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
                console.log(error);
            }
        }

        const body = {
            pastor_section: {
                title,
                description,
                first_name,
                last_name,
                mobile,
                ...(result && {
                    public_id: result.public_id,
                    secure_url: result.secure_url
                })
            }
        };

        const updated = await updatePastor(user?.church, body);
        return NextResponse.json({ success: true, data: updated });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
};
