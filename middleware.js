import { NextResponse } from 'next/server';
import { AuthService } from './lib/AuthService';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  // Skip middleware for NextAuth routes
  if (req.nextUrl.pathname.startsWith('/api/auth') || req.nextUrl.pathname.startsWith('/api/stripe') || req.nextUrl.pathname.startsWith('/api/subscriber') || req.nextUrl.pathname.startsWith('/api/webhooks')) {
    return NextResponse.next();
  }

  try {
   
    const token = await getToken({
      req: req,
      secret: process.env.NEXTAUTH_SECRET?.trim(),
      secureCookie: false
    });

    if (token) {
      const path = req.nextUrl.pathname;
      const isPlatformAdmin = !token.church;

      // Platform admins (no church) must not access church-specific routes
      if (isPlatformAdmin && path.startsWith('/protected/church')) {
        return NextResponse.redirect(new URL('/protected/admin/dashboard', req.url));
      }

      // Church users must not access platform admin routes
      if (!isPlatformAdmin && path.startsWith('/protected/admin')) {
        return NextResponse.redirect(new URL('/protected/church/dashboard', req.url));
      }

      return NextResponse.next();
    }

    // Checked before the staff bearer-token path below: a mobile/public
    // request always carries this (see winners-chapel-mobile's apiClient.ts
    // interceptor), and a staff dashboard request never does. Once a
    // member is logged in, the mobile app's requests also carry an
    // Authorization: Bearer <memberToken> header (same interceptor,
    // unconditional once a member session exists) — that token is signed
    // with MEMBER_JWT_SECRET via jsonwebtoken, not the ACCESS_TOKEN_SECRET
    // AuthService.verifyAccessToken() (jose) expects, so checking the
    // bearer path first for these requests only ever produced a doomed
    // ERR_JWS_SIGNATURE_VERIFICATION_FAILED before falling through to this
    // same nj-api-key success anyway. Checking nj-api-key first skips that
    // wasted, noisy verification attempt entirely.
    const key = req.headers.get('nj-api-key');
    if (key) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-nj-client-id', key);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const bearerToken = authHeader.split(' ')[1];
      try {
        const decoded = await AuthService.verifyAccessToken(bearerToken);
        if (decoded) return NextResponse.next();
      } catch (e) {
        console.warn('Invalid bearer token');
      }
    }

    const returnUrl = encodeURIComponent(req.nextUrl.pathname);
    return NextResponse.redirect(new URL(`/login?returnUrl=${returnUrl}`, req.url));
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return NextResponse.json({ error: 'Internal server error', message: 'Authentication failed' }, { status: 500 });
  }
}

export const config = {
  matcher: [
    '/protected/:path*',
    '/api/:path*'
  ]
};