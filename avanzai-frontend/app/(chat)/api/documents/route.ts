import { auth } from '@/app/(auth)/auth';
import { getDocumentsByChatId } from '@/lib/db/queries';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new Response('Chat ID is required', { status: 400 });
  }

  // Validate UUID format
  if (chatId === 'unknown' || !UUID_REGEX.test(chatId)) {
    console.log(`Invalid UUID format for chatId: ${chatId}`);
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
      status: 200 // Return empty array instead of error
    });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const documents = await getDocumentsByChatId({ chatId });
    return new Response(JSON.stringify(documents), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to get documents:', error);
    return new Response('Failed to get documents', { status: 500 });
  }
} 