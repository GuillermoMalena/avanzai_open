import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Check for auth pages and API routes
  const isAuthPage = request.nextUrl.pathname === '/login' || 
                     request.nextUrl.pathname === '/register' ||
                     request.nextUrl.pathname.startsWith('/auth');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/');
  const isHistoryRoute = request.nextUrl.pathname === '/api/history';

  try {
    // Use our middleware client to update the session and get the response
    const { supabase, response, user } = await updateSession(request);
    
    // Get cookie names for debugging
    const cookieNames = request.cookies.getAll().map(cookie => cookie.name);
    
    // Enhanced debugging
    console.log('Middleware:', {
      path: request.nextUrl.pathname,
      hasSession: !!user,
      isAuthPage,
      isApiRoute,
      sessionUserId: user?.id || 'none',
      cookies: cookieNames
    });
    
    // If we have a user and this is an API route, add the user ID to the request
    if (user?.id && isApiRoute) {
      // We need to create a new response but maintain the cookies
      const newResponse = NextResponse.next({
        request: {
          headers: new Headers(request.headers),
        },
      });
      
      // Copy cookies from the original response
      response.cookies.getAll().forEach(cookie => {
        newResponse.cookies.set(cookie.name, cookie.value);
      });
      
      // Add the user ID as a header
      newResponse.headers.set('x-supabase-user-id', user.id);
      
      // Add the user ID to the URL for GET requests to history API
      if (request.method === 'GET' && isHistoryRoute) {
        // Check if uid param is already set
        const url = new URL(request.url);
        const hasUid = url.searchParams.has('uid');
        
        // Only set uid if it's not already in the URL
        if (!hasUid) {
          console.log(`Adding uid=${user.id} to history API request`);
          url.searchParams.set('uid', user.id);
          
          // Return a rewrite to the new URL
          const rewriteResponse = NextResponse.rewrite(url);
          
          // Copy cookies to ensure session persistence
          response.cookies.getAll().forEach(cookie => {
            rewriteResponse.cookies.set(cookie.name, cookie.value);
          });
          
          return rewriteResponse;
        }
      }
      
      return newResponse;
    }
    
    // No authentication check for browsing - only require auth at the action level
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
