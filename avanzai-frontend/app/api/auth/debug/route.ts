import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get cookies from request for debugging
    const cookieNames = request.cookies.getAll().map(cookie => cookie.name);
    
    // Get auth header for debugging
    const authHeader = request.headers.get('authorization');
    
    return Response.json({
      cookieCount: cookieNames.length,
      cookies: cookieNames,
      hasAuthHeader: !!authHeader,
      requestInfo: {
        method: request.method,
        url: request.url,
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({
      error: errorMessage
    }, { status: 500 });
  }
} 