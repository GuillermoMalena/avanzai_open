import { env } from '@/env.mjs';

export async function updateChatTemplate(chatId: string, userQuery: string, userId: string) {
  const res = await fetch(`${env.NEXT_PUBLIC_FASTAPI_BASE_URL}/update_assumptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      user_query: userQuery,
      user_id: userId,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to update chat template');
  }
  return res.json();
} 