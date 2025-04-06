import { ChatRequestOptions, Message } from 'ai';
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
}

function PureMessages({
  chatId,
  isLoading,
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

      {messages.map((message, index) => (
        <PreviewMessage
          key={message.id}
          chatId={chatId}
          message={message}
          isLoading={isLoading && messages.length - 1 === index}
          vote={
            votes
              ? votes.find((vote) => vote.messageId === message.id)
              : undefined
          }
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
        />
      ))}

      {isLoading &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'user' && <ThinkingMessage />}

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
  if (prevProps.isReadonly !== nextProps.isReadonly) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});
