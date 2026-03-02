import { add, update } from '../../../services/addressServices';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';
import { getUserSession } from '../../../../utils/generateToken';

export const POST = async (req) => {
    try {

        const user = await getUserSession(req);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { data } = await add(user.church, body);
        return NextResponse.json({ data, success: true });
    } catch (error) {
        logger.error(error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
};

export const PUT = async (req) => {
    try {
        const url = new URL(req.url);
        const user = await getUserSession(req);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body = await req.json();
        const id = url.searchParams.get('id');
        const data = await update(id, body);
        return NextResponse.json({ data, success: true });
    } catch (error) {
        logger.error(error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
};

