import { removeMember, verifyMemberToken } from '../../../services/memberService';
import { logger } from '../../../../utils/logger';
import { NextResponse } from 'next/server';
import { getUserSession } from '../../../../utils/generateToken';

export const DELETE = async (req) => {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    // Staff/admin removing a member from the church dashboard — unchanged.
    const user = await getUserSession(req);
    if (user) {
      const data = await removeMember(user.church, id);
      return NextResponse.json({ data, success: true });
    }

    // Mobile self-service deletion — getUserSession() only recognizes
    // NextAuth (web-admin) sessions or tokens signed with
    // NEXT_PUBLIC_ACCESS_TOKEN_SECRET, never a member's own token (signed
    // separately with MEMBER_JWT_SECRET via generateMemberToken, by design
    // — see the note on JWT_SECRET in memberService.js), so a genuine
    // member request always fell through to Unauthorized before this. A
    // member may only ever delete their own record — the id in the URL
    // must match the id embedded in their own token.
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const memberPayload = verifyMemberToken(authHeader.split(' ')[1]);
        if (memberPayload?.memberId && memberPayload.memberId === id) {
          const data = await removeMember(memberPayload.church, id);
          return NextResponse.json({ data, success: true });
        }
      } catch (tokenError) {
        // Invalid/expired member token — fall through to Unauthorized.
      }
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
};
