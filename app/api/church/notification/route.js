import { logger } from '../../../../utils/logger';
import { getNotification, updateNotification } from '../../../services/churchService';
import { NextResponse } from 'next/server';
import { getUserSession } from '../../../../utils/generateToken';

export const config = {
    api: { bodyParser: false }
};

export const GET = async (req) => {
    try {
        const user = await getUserSession(req);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await getNotification(user?.church);
        return NextResponse.json({ success: true, data });

    } catch (error) {
        logger.error(error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
};

export const PUT = async (req) => {
    try {
        const user = await getUserSession(req);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();

        const type = formData.get('type');
        const title = formData.get('title');
        const message = formData.get('message');
        const priority = formData.get('priority');
        const status = formData.get('status');
        const start_date = formData.get('start_date');
        const expiry_date = formData.get('expiry_date');
        const file = formData.get('file');
        const removeImage = formData.get('removeImage');

        // Uploading (and, on edit, replacing/deleting/clearing the previous
        // image) is handled by churchService.updateNotification via
        // CloudinaryService - this route only extracts the raw form fields.
        const updated = await updateNotification(user?.church, {
            type: type || 'announcement',
            title,
            message,
            priority: priority || 'normal',
            status: status === 'true',
            start_date: start_date || null,
            expiry_date: expiry_date || null,
            file: file || null,
            removeImage: removeImage === 'true'
        });
        return NextResponse.json({ success: true, data: updated });

    } catch (error) {
        logger.error(error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
};
