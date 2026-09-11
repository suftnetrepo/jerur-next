import { decrypt } from '../../../../utils/helpers';
import { authenticateMember, generateMemberToken, MemberAuthError } from '../../../services/memberService';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';
import { getMemberCredentials, getMobileClientId } from '../mobileAuthRequest';

export const POST = async (req) => {
  try {
    const clientId = getMobileClientId(req);

    if (!clientId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const church = decrypt(clientId);

    if (!church) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { identifier, pin } = getMemberCredentials(body);

    if (!identifier || !pin) {
      return NextResponse.json({ success: false, error: 'Phone/email and PIN are required.' }, { status: 400 });
    }

    const member = await authenticateMember({ church, identifier, pin });
    const token = generateMemberToken(member);

    return NextResponse.json({
      success: true,
      data: {
        token,
        member: {
          _id: member._id,
          first_name: member.first_name,
          last_name: member.last_name,
          status: member.status,
          role: member.role
        }
      }
    });
  } catch (error) {
    logger.error(error);

    if (error instanceof MemberAuthError) {
      const status = error.code === 'LOCKED' ? 429 : error.code === 'INACTIVE' ? 403 : 401;
      return NextResponse.json({ success: false, error: error.message, code: error.code }, { status });
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
};
