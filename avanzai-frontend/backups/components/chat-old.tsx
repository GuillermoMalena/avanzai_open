'use client';

import type { Attachment, Message } from 'ai';
import { useChat } from 'ai/react';
import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useRouter } from 'next/navigation';

import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher, generateUUID, cn } from '@/lib/utils';
import { updateChatTemplate } from '@/lib/api';
import { VisibilityType } from './visibility-selector';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';

import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import { useArtifactSelector, useArtifact } from '@/hooks/use-artifact';
import { toast } from 'sonner';

interface ChatProps {
  id: string;
  initialMessages: Array<Message>;
  selectedChatModel: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}

export function Chat({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
}: ChatProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { artifact, setArtifact } = useArtifact();
  const {
    messages,
    setMessages,
    handleSubmit: originalHandleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    reload,
  } = useChat({
    id,
    body: { 
      id, 
      selectedChatModel: 'chat-model-large',
    },
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    onFinish: () => {
      mutate('/api/history');
    },
    onError: (error) => {
      toast.error('An error occurred, please try again!');
    },
  });

  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  // Handle template updates and chat submission
  const handleSubmit = async (event?: { preventDefault?: () => void }) => {
    if (event?.preventDefault) {
      event.preventDefault();
    }

    // Check if user is authenticated with Supabase
    if (!user) {
      toast.error('Please sign in to continue.');
      router.push('/login');
      return;
    }

    if (!input?.trim()) {
      return;
    }

    try {
      // Store current artifact state
      const currentArtifact = artifact;
      
      // Call the original submit handler
      await originalHandleSubmit(event);

      // Restore artifact state if it was visible
      if (currentArtifact.isVisible) {
        setArtifact(currentArtifact);
      }

      // Clear attachments after submission
      setAttachments([]);

    } catch (error) {
      console.error('Error submitting message:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={selectedChatModel}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />

        <Messages
          chatId={id}
          isLoading={isLoading}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
        />

        {/* Only show the MultimodalInput when there are messages (after first submission) */}
        {messages.length > 0 && (
          <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
            {!isReadonly && (
              <MultimodalInput
                chatId={id}
                input={input}
                setInput={setInput}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
                stop={stop}
                attachments={attachments}
                setAttachments={setAttachments}
                messages={messages}
                setMessages={setMessages}
                append={append}
              />
            )}
          </form>
        )}
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
      />
    </>
  );
}
