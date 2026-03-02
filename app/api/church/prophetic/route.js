import { logger } from '../../../../utils/logger';
import {
    updateProphetic
} from '../../../services/churchService';
import { NextResponse } from 'next/server';
import { getUserSession } from '../../../../utils/generateToken';

export const PUT = async (req) => {
    try {
        const user = await getUserSession(req);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const updated = await updateProphetic(user?.church, body);
        return NextResponse.json({ success: true, data: updated });

    } catch (error) {
        logger.error(error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
};
