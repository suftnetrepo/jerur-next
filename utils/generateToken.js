import jwt from 'jsonwebtoken';
import { getToken } from 'next-auth/jwt';
import { AuthService } from '../lib/AuthService';
import { churchHasAdminEntitlement } from '../app/services/entitlementService';

export const getAccessToken = (payload) => {
  return jwt.sign(payload, process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
};

export const getRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.NEXT_PUBLIC_REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

export async function getUserSession(req, options = {}) {
  const { requireActiveSubscription = true } = options;
  const token = await getToken({
    req: req,
    secret: process.env.NEXTAUTH_SECRET?.trim(),
    secureCookie: false
  });
  if (token?.email) {
    if (requireActiveSubscription && !(await churchHasAdminEntitlement(token.church))) {
      return null;
    }
    return token;
  }

  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const rawToken = authHeader.split(' ')[1];
    try {
      const decoded = await AuthService.verifyAccessToken(rawToken);
      // Mobile and integration bearer tokens use their own authorization and
      // church feature-flag flow. Paid admin entitlement enforcement must not
      // alter those existing contracts.
      if (decoded) return decoded;
    } catch (e) {
      return null;
    }
  }

  return null;
}
