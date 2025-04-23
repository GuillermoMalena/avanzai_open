import { auth } from '@/app/(auth)/auth';
import { getDocumentById } from '@/lib/db/queries';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  // Await the entire params object first
  const params = await context.params;
  const id = params.id;

  // Validate UUID format
  if (id === 'unknown' || !UUID_REGEX.test(id)) {
    console.log(`Invalid UUID format for document id: ${id}`);
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const document = await getDocumentById({ id });

    if (!document) {
      return new Response('Not Found', { status: 404 });
    }

    if (document.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    return Response.json(document);
  } catch (error) {
    console.error('Failed to get document:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 