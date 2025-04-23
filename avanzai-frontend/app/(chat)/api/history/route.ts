import { getChatsByUserId, releaseConnection } from '@/lib/db/queries';
import { withDbCleanup } from '@/lib/db-middleware';

// Wrap the handler with DB cleanup to ensure connections are closed
export const GET = withDbCleanup(async (request: Request) => {
  try {
    // Get user ID from URL query params or header
    const url = new URL(request.url);
    const queryUserId = url.searchParams.get('uid');
    
    // Get headers (headers is a Headers object)
    const headers = request.headers;
    const headerUserId = headers.get('x-supabase-user-id');
    
    // Use query param first, then header as fallback
    const userId = queryUserId || headerUserId;
    
    console.log('History API:', {
      queryUserId,
      headerUserId,
      finalUserId: userId,
      url: request.url
    });

    if (!userId) {
      console.error('No user ID provided in request (query param or header)');
      return Response.json({ error: 'Unauthorized', details: 'No user ID provided' }, { status: 401 });
    }

    // Get chats for the provided user ID
    // This relies on middleware already authenticating the request
    const chats = await getChatsByUserId({ id: userId });
    console.log(`Found ${chats.length} chats for user ${userId}`);
    return Response.json(chats);
  } catch (error) {
    console.error('History API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});
