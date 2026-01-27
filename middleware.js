import { NextResponse } from 'next/server';
import { AuthService } from './lib/AuthService';
import { getToken } from 'next-auth/jwt';

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
      const response = NextResponse.next();
      response.headers.set('nj-client-id', key);
      return response } catch (error) {
        return NextResponse.json({ error: 'Unauthorized', message: 'Invalid API Key' }, { status: 401 });
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
    // Protected routes
    '/protected/:path*',

    // Protected API routes
    // '/api/:path*'
  ]
};
