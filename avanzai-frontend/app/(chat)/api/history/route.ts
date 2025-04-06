import { auth } from '@/app/(auth)/auth';
import { getChatsByUserId, releaseConnection } from '@/lib/db/queries';
import { withDbCleanup } from '@/lib/db-middleware';

// Wrap the handler with DB cleanup to ensure connections are closed
export const GET = withDbCleanup(async () => {
  const session = await auth();

  if (!session || !session.user) {
    return Response.json('Unauthorized!', { status: 401 });
  }

  // biome-ignore lint: Forbidden non-null assertion.
  const chats = await getChatsByUserId({ id: session.user.id! });
  return Response.json(chats);
});
