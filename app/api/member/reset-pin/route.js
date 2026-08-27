import { resetMemberPin } from '../../../services/memberService';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';
import { getUserSession } from '../../../../utils/generateToken';

// Admin "forgot PIN" recovery — church dashboard Members page looks the
// member up, then sets a new PIN on their behalf. Staff-session gated
// (getUserSession), same as update/route.js — never reachable by the
// mobile app's member session, which only ever proves who it already is,
// not who it's allowed to reset.
export const PUT = async (req) => {
  try {
    const user = await getUserSession(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const body = await req.json();

    await resetMemberPin(id, body.pin);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
