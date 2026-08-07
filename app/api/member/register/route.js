import { decrypt } from '../../../../utils/helpers';
import { registerMember } from '../../../services/memberService';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';

export const POST = async (req) => {
  try {
    const clientId = req.headers.get('x-nj-client-id');

    if (!clientId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const church = decrypt(clientId);
    const body = await req.json();

    const member = await registerMember({
      church,
      first_name: body.first_name,
      last_name: body.last_name,
      mobile: body.mobile,
      email: body.email,
      pin: body.pin
    });

    // pinHash is select:false on the model, so it's already excluded here —
    // nothing further to strip before returning the created member.
    return NextResponse.json({ data: member, success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
};
