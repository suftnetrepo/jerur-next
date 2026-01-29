import { NextResponse } from 'next/server';
import { AuthService } from './lib/AuthService';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  try {
   
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
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-nj-client-id', key);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
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
    '/api/:path*'  // Make sure your API routes are matched
  ]
};