import { cookies } from 'next/headers';

import { Chat } from '@/components/chat';
import { generateUUID } from '@/lib/utils';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';

export default async function Page() {
  const id = generateUUID();

  return (
    <Chat
      key={id}
      id={id}
      initialMessages={[]}
      selectedChatModel={DEFAULT_CHAT_MODEL}
      selectedVisibilityType="private"
      isReadonly={false}
    />
  );
}
