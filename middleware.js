import { NextResponse } from 'next/server';
import { AuthService } from './lib/AuthService';
import { getToken } from 'next-auth/jwt';
import { single } from '@/hooks/useSettings';
import { decrypt } from '@/utils/helpers';

const isApiRoute = (pathname) => pathname.startsWith('/api');

export async function middleware(req) {
  try {
    const { pathname } = req.nextUrl;

    const token = await getToken({
      req: req,
      secret: process.env.NEXTAUTH_SECRET?.trim(),
      secureCookie: false
    });

    if (token) {
      return NextResponse.next();
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

    const key = req.headers.get('nj-api-key');
    if (key) {
      try {
      const identifier = decrypt(key);
      const result = await single(identifier);

      if (!result) {
        return NextResponse.json({ error: 'Unauthorized', message: 'Invalid API Key' }, { status: 403 });
      }
      const response = NextResponse.next();
      response.headers.set('nj-client-id', String(result?._id));
      return response } catch (error) {
        return NextResponse.json({ error: 'Unauthorized', message: 'Invalid API Key' }, { status: 401 });
      }
    }

    if (isApiRoute(pathname)) {
      return NextResponse.json(
        { error: 'Unauthorized', message: message || 'Authentication required' },
        { status: 401 }
      );
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
    // Protected routes
    '/protected/:path*',

    // Protected API routes
    '/api/church/:path*'
  ]
};
