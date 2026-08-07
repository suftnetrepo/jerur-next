import { logger } from '../../../../utils/logger';
import {
    updatePastor
} from '../../../services/churchService';
import { NextResponse } from 'next/server';
import { getUserSession } from '../../../../utils/generateToken';

export const config = {
    api: { bodyParser: false }
};

export const PUT = async (req) => {
    try {
        const user = await getUserSession(req);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();

        const title = formData.get('title');
        const first_name = formData.get('first_name');
        const last_name = formData.get('last_name');
        const description = formData.get('description');
        const file = formData.get('file');

        // Uploading (and, on edit, replacing/deleting the previous image) is
        // handled by churchService.updatePastor via CloudinaryService - this
        // route only extracts the raw form fields.
        const updated = await updatePastor(user?.church, {
            title,
            first_name,
            last_name,
            description,
            file: file || null
        });
        return NextResponse.json({ success: true, data: updated });

    } catch (error) {
        logger.error(error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
};
