import { decrypt } from '../../../../utils/helpers';
import { forgotPin, MemberAuthError } from '../../../services/memberService';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';

// Mobile self-service "forgot PIN" — same auth shape as member/login (a
// valid nj-api-key is all that's required, no staff session), but instead
// of verifying a PIN it replaces one outright. See forgotPin()'s comment in
// memberService.js for why this is deliberately less restrictive than the
// admin recovery path (member/reset-pin, staff-session gated).
export const POST = async (req) => {
  try {
    const clientId = req.headers.get('x-nj-client-id');

    if (!clientId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const church = decrypt(clientId);

    if (!church) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    if (!body.identifier || !body.pin) {
      return NextResponse.json({ success: false, error: 'Phone/email and new PIN are required.' }, { status: 400 });
    }

    await forgotPin({ church, identifier: body.identifier, pin: body.pin });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(error);

    if (error instanceof MemberAuthError) {
      const status = error.code === 'INACTIVE' ? 403 : 400;
      return NextResponse.json({ success: false, error: error.message, code: error.code }, { status });
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
};
