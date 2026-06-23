import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function proxy(req: NextRequest) {
  console.log("[Proxy] Route:", req.nextUrl.pathname);
  
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });
    
    console.log("[Proxy] Token decoded:", token ? "YES" : "NO");
    
    if (!token) {
      console.log("[Proxy] Missing or invalid token! Rejecting access.");
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error("[Proxy] Error decoding token:", error);
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/tasks/:path*",
    "/api/settings/:path*",
    "/portal/:path*",
    "/disturbance/:path*",
  ],
};
