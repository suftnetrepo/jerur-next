import { logger } from '../../../../utils/logger';
import { getNotification, updateNotification } from '../../../services/churchService';
import { NextResponse } from 'next/server';
import { getUserSession } from '../../../../utils/generateToken';

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

        const body = await req.json();
        const updated = await updateNotification(user?.church, body);
        return NextResponse.json({ success: true, data: updated });

    } catch (error) {
        logger.error(error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
};
