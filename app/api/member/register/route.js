import { decrypt } from '../../../../utils/helpers';
import { registerMember, MemberAuthError } from '../../../services/memberService';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';

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

    if (error instanceof MemberAuthError) {
      // 409 Conflict for the "this already exists" cases; registerMember
      // never throws MemberAuthError for anything else. Both `error` and
      // `message` carry the same friendly text — the mobile client's
      // apiErrorMessage() reads either — so callers don't need to know
      // which field name to look at.
      return NextResponse.json(
        { success: false, code: error.code, error: error.message, message: error.message },
        { status: 409 }
      );
    }

    // Anything else here is one of registerMember's own thrown Error()s
    // with an already-friendly message (missing fields, bad PIN format,
    // etc.) — never a raw Mongo error. registerMember's only real
    // database failure mode (E11000 on the email index) is already
    // caught and translated to a MemberAuthError before it can surface
    // here, so error.message is always safe to hand to the client as-is.
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
};
