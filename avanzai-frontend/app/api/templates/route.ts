import { getChatTemplates } from '@/lib/db/queries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new Response('Chat ID is required', { status: 400 });
  }

  try {
    const templates = await getChatTemplates({ id: chatId });
    return Response.json(templates);
  } catch (error) {
    console.error('Failed to get templates:', error);
    return new Response('Failed to get templates', { status: 500 });
  }
} 