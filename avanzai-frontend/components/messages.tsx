import { ChatRequestOptions } from 'ai';
import { Message } from '@ai-sdk/react';
import { PreviewMessage, ThinkingMessage } from './message';
import { useScrollToBottom } from './use-scroll-to-bottom';
import { SimpleOverview } from './simple-overview';
import { memo } from 'react';
import { Vote } from '@/lib/db/schema';
import equal from 'fast-deep-equal';
import { cn } from '@/lib/utils';

interface MessagesProps {
  chatId: string;
  isLoading: boolean;
  votes: Array<Vote> | undefined;
  messages: Array<Message>;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
  isArtifactVisible: boolean;
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (event?: { preventDefault?: () => void }) => void;
  status?: 'error' | 'streaming' | 'submitted' | 'ready' | 'reasoning-start' | 'reasoning-complete';
}

function PureMessages({
  chatId,
  isLoading,
  status,
  votes,
  messages,
  setMessages,
  reload,
  isReadonly,
  isArtifactVisible,
  input,
  setInput,
  handleSubmit,
}: MessagesProps) {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  // Debug rendering state 
  console.log('[MESSAGES-DEBUG] Rendering messages:', { 
    count: messages.length,
    status,
    isLoading,
    lastMessageHasParts: messages.length > 0 ? !!messages[messages.length-1].parts : false,
  });

  return (
    <div
      ref={messagesContainerRef}
      className={cn(
        "flex flex-col gap-6 flex-1 overflow-y-auto scrollbar-none pt-4",
        isArtifactVisible ? "max-w-[400px]" : "mx-auto max-w-3xl w-full"
      )}
    >
      {messages.length === 0 && (
        <SimpleOverview 
          input={input} 
          setInput={setInput} 
          handleSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
      )}

      {messages.map((message, index) => {
        // Add log to track isReasoning for this message
        const isMessageReasoning = (status === 'streaming' || status === 'reasoning-start' || status === 'reasoning-complete') && messages.length - 1 === index;
        
        if (index === messages.length - 1) {
          console.log('[MESSAGES-ISREASONING] Current status:', { 
            status, 
            isReasoning: isMessageReasoning,
            messageId: message.id
          });
        }
        
        return (
          <PreviewMessage
            key={message.id}
            chatId={chatId}
            message={message}
            isLoading={isLoading && messages.length - 1 === index}
            isReasoning={isMessageReasoning}
            vote={
              votes
                ? votes.find((vote) => vote.messageId === message.id)
                : undefined
            }
            setMessages={setMessages}
            reload={reload}
            isReadonly={isReadonly}
          />
        );
      })}

      {(isLoading || status === 'reasoning-start') &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'user' && (
          <ThinkingMessage status={status} />
        )}

      <div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
      />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isArtifactVisible !== nextProps.isArtifactVisible) return false;
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.isReadonly !== nextProps.isReadonly) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});
