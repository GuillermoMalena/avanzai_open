'use client';

import type { ChatRequestOptions, Message } from 'ai';
import { Message as AIMessage } from '@ai-sdk/react';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useMemo, useState, useEffect } from 'react';

import type { Vote } from '@/lib/db/schema';

import { DocumentToolCall, DocumentToolResult } from './document';
import {
  ChevronDownIcon,
  PencilEditIcon,
  SparklesIcon,
  FileIcon,
} from './icons';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { PreviewAttachment } from './preview-attachment';
import { Weather } from './weather';
import equal from 'fast-deep-equal';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { MessageEditor } from './message-editor';
import { DocumentPreview } from './document-preview';
import { useArtifact } from '@/hooks/use-artifact';
import { MessageLoading } from './ui/message-loading';
import { ReasoningMessagePart, TextMessagePart } from './messages-reasoning';

// Import the exported ReasoningPart interface
import type { ReasoningPart } from './messages-reasoning';

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  isReasoning = false,
  setMessages,
  reload,
  isReadonly,
}: {
  chatId: string;
  message: AIMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  isReasoning?: boolean;
  setMessages: (
    messages: AIMessage[] | ((messages: AIMessage[]) => AIMessage[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const { setArtifact } = useArtifact();
  // Add state for captured reasoning content from annotations
  const [reasoningContent, setReasoningContent] = useState('');

  // Helper to check if the message has any parts
  const hasParts = message.parts && message.parts.length > 0;
  
  // Safe message parts array
  const messageParts = message.parts || [];

  // Effect to capture reasoning annotations
  useEffect(() => {
    // Check if message has reasoning content in annotations
    if (message.annotations) {
      const reasoningChunks = message.annotations.filter(a => 
        a && typeof a === 'object' && 'type' in a && a.type === 'reasoning-chunk'
      );
      
      if (reasoningChunks.length > 0) {
        // Get the latest reasoning chunk
        const latestReasoning = reasoningChunks[reasoningChunks.length - 1];
        if (latestReasoning && typeof latestReasoning === 'object' && 'value' in latestReasoning) {
          const reasoningValue = String(latestReasoning.value || '');
          console.log('[MESSAGE-DEBUG] Found reasoning annotation:', reasoningValue.substring(0, 50) + '...');
          setReasoningContent(reasoningValue);
        }
      }
    }
  }, [message.annotations]);

  // Flag for showing reasoning from annotations  
  const hasReasoningAnnotation = reasoningContent && message.role === 'assistant';

  return (
    <AnimatePresence>
      <motion.div
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            'flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-fit': mode !== 'edit',
            },
          )}
        >
          {message.role === 'assistant' && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 w-full">
            {message.experimental_attachments && (
              <div className="flex flex-row justify-end gap-2">
                {message.experimental_attachments.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={attachment}
                  />
                ))}
              </div>
            )}

            {/* If using the new parts API */}
            {hasParts && mode === 'view' && (
              <div className="flex flex-col gap-2">
                {/* Display reasoning from annotations if available, but only if there's no reasoning part */}
                {hasReasoningAnnotation && !messageParts.some(p => p.type === 'reasoning') && (
                  <ReasoningMessagePart
                    key={`${message.id}-reasoning-annotation`}
                    part={{
                      type: 'reasoning',
                      reasoning: reasoningContent,
                      details: [{ type: 'text', text: reasoningContent }]
                    } as ReasoningPart}
                    isReasoning={isReasoning || (isLoading && message.role === 'assistant')}
                  />
                )}

                {messageParts.map((part, partIndex) => {
                  if (part.type === 'text') {
                    return (
                      <div 
                        key={`${message.id}-text-${partIndex}`}
                        className={cn('flex flex-row gap-2 items-start', {
                          'ml-auto': message.role === 'user',
                        })}
                      >
                        {message.role === 'user' && !isReadonly && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                                onClick={() => {
                                  setMode('edit');
                                }}
                              >
                                <PencilEditIcon />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit message</TooltipContent>
                          </Tooltip>
                        )}

                        <div
                          className={cn('flex flex-col gap-4', {
                            'bg-primary text-primary-foreground px-3 py-2 rounded-xl':
                              message.role === 'user',
                          })}
                        >
                          <TextMessagePart text={part.text} />
                        </div>
                      </div>
                    );
                  }

                  if (part.type === 'reasoning') {
                    // Cast to the type our component expects
                    console.log('[REASONING-VIEWER-DEBUG] Rendering reasoning part:', {
                      isReasoning,
                      partIndex,
                      totalParts: messageParts.length,
                      detailsCount: part.details?.length || 0,
                    });
                  
                    return (
                      <ReasoningMessagePart
                        key={`${message.id}-reasoning-${partIndex}`}
                        part={part as unknown as ReasoningPart}
                        isReasoning={isReasoning && partIndex === messageParts.length - 1}
                      />
                    );
                  }

                  return null;
                })}
              </div>
            )}

            {/* Fallback for older messages without parts */}
            {!hasParts && message.content && mode === 'view' && (
              <div className="flex flex-row gap-2 items-start">
                {/* Display reasoning from annotations if available */}
                {hasReasoningAnnotation && (
                  <ReasoningMessagePart
                    key={`${message.id}-reasoning-annotation`}
                    part={{
                      type: 'reasoning',
                      reasoning: reasoningContent,
                      details: [{ type: 'text', text: reasoningContent }]
                    } as ReasoningPart}
                    isReasoning={isReasoning || (isLoading && message.role === 'assistant')}
                  />
                )}

                {message.role === 'user' && !isReadonly && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                        onClick={() => {
                          setMode('edit');
                        }}
                      >
                        <PencilEditIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit message</TooltipContent>
                  </Tooltip>
                )}

                <div
                  className={cn('flex flex-col gap-4', {
                    'bg-primary text-primary-foreground px-3 py-2 rounded-xl':
                      message.role === 'user',
                  })}
                >
                  <Markdown>{message.content as string}</Markdown>
                </div>
              </div>
            )}

            {/* Handle edit mode */}
            {message.content && mode === 'edit' && (
              <div className="flex flex-row gap-2 items-start">
                <div className="size-8" />

                <MessageEditor
                  key={message.id}
                  message={message as Message}
                  setMode={setMode}
                  setMessages={setMessages as any}
                  reload={reload}
                />
              </div>
            )}

            {message.toolInvocations && message.toolInvocations.length > 0 && (
              <div className="flex flex-col gap-4">
                {message.toolInvocations.map((toolInvocation) => {
                  const { toolName, toolCallId, state, args } = toolInvocation;

                  // Handle requestTemplateUpdate specially
                  if (toolName === 'requestTemplateUpdate') {
                    if (isLoading) {
                      return <ThinkingMessage key={toolCallId} message={message as Message} status="reasoning-start" />;
                    }

                    // If we have a result, show the document preview with preserved metadata
                    if (state === 'result' && 'result' in toolInvocation) {
                      const templateType = toolInvocation.result?.updatedTemplates?.currentTemplate;
                      const templateTitle = templateType 
                        ? `${templateType.charAt(0).toUpperCase() + templateType.slice(1)} Template`
                        : 'Financial Templates';
                      
                      return (
                        <div key={toolCallId} className="my-2 w-full">
                          <div className="mb-2 text-sm text-gray-500">
                            Templates have been updated. Click to view:
                          </div>
                          <DocumentPreview
                            isReadonly={isReadonly}
                            result={null}
                            args={{
                              chatId: chatId,
                              templateType: templateType,
                              title: templateTitle,
                              kind: 'sheet'
                            }}
                          />
                        </div>
                      );
                    }

                    return (
                      <div key={toolCallId} className="flex flex-col w-full border rounded-2xl dark:bg-muted dark:border-zinc-700">
                        <div className="h-[257px] flex items-center justify-center text-muted-foreground">
                          Processing Query...
                        </div>
                      </div>
                    );
                  }

                  // Handle other tool invocations as before...
                  if (state === 'result') {
                    const { result } = toolInvocation;
                    return (
                      <div key={toolCallId}>
                        {toolName === 'getWeather' ? (
                          <Weather weatherAtLocation={result} />
                        ) : toolName === 'createDocument' ? (
                          <DocumentPreview
                            isReadonly={isReadonly}
                            result={result}
                          />
                        ) : toolName === 'updateDocument' ? (
                          <DocumentToolResult
                            type="update"
                            result={result}
                            isReadonly={isReadonly}
                          />
                        ) : toolName === 'requestSuggestions' ? (
                          <DocumentToolResult
                            type="request-suggestions"
                            result={result}
                            isReadonly={isReadonly}
                          />
                        ) : toolName === 'processFinancialData' ? (
                          state === 'result' ? (
                            <DocumentPreview
                              isReadonly={isReadonly}
                              result={null}
                              args={{
                                chatId,
                                title: `Financial Data: ${result.tickers?.join(', ') || 'Loading...'}`,
                                kind: 'financial'
                              }}
                            />
                          ) : null
                        ) : toolName === 'processUniverseData' ? (
                          state === 'result' ? (
                            <DocumentPreview
                              isReadonly={isReadonly}
                              result={null}
                              args={{
                                chatId,
                                title: `Universe Ranking: ${result.data?.universeData?.metadata?.metric || 'Performance'}`,
                                kind: 'financial'
                              }}
                            />
                          ) : null
                        ) : null}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={toolCallId}
                      className={cx({
                        skeleton: ['getWeather'].includes(toolName),
                      })}
                    >
                      {toolName === 'getWeather' ? (
                        <Weather />
                      ) : toolName === 'createDocument' ? (
                        <DocumentPreview isReadonly={isReadonly} args={args} />
                      ) : toolName === 'updateDocument' ? (
                        <DocumentToolCall
                          type="update"
                          args={args}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === 'requestSuggestions' ? (
                        <DocumentToolCall
                          type="request-suggestions"
                          args={args}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === 'processFinancialData' ? (
                        <div className="flex flex-col w-full border rounded-2xl dark:bg-muted dark:border-zinc-700">
                          <div className="h-[257px] flex items-center justify-center text-muted-foreground">
                            Processing Financial Data...
                          </div>
                        </div>
                      ) : toolName === 'processUniverseData' ? (
                        <div className="flex flex-col w-full border rounded-2xl dark:bg-muted dark:border-zinc-700">
                          <div className="h-[257px] flex items-center justify-center text-muted-foreground">
                            Processing Universe Data...
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message as Message}
                vote={vote}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.isReasoning !== nextProps.isReasoning) return false;
    if (prevProps.message.content !== nextProps.message.content) return false;
    if (
      !equal(
        prevProps.message.toolInvocations,
        nextProps.message.toolInvocations,
      )
    )
      return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;
    // Add check for annotations changes
    if (!equal(prevProps.message.annotations, nextProps.message.annotations)) return false;

    return true;
  },
);

export const ThinkingMessage = ({ message, status }: { message?: Message; status?: string }) => {
  const role = 'assistant';

  // Simplified loading message logic
  const getLoadingMessage = () => {
    if (status === 'reasoning-start') {
      return 'Thinking...';
    }
    if (message?.toolInvocations?.some(tool => tool.toolName === 'processFinancialData')) {
      return 'Processing Financial Data...';
    }
    if (message?.toolInvocations?.some(tool => tool.toolName === 'processUniverseData')) {
      return 'Processing Universe Data...';
    }
    if (message?.toolInvocations?.some(tool => tool.toolName === 'requestTemplateUpdate')) {
      return 'Processing Template Update...';
    }
    if (message?.toolInvocations?.some(tool => ['createDocument', 'updateDocument'].includes(tool.toolName))) {
      return 'Preparing Document...';
    }
    return 'Thinking...';
  };

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 0.3 } }}
      data-role={role}
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
          {
            'group-data-[role=user]/message:bg-muted': true,
          },
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <MessageLoading />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            {getLoadingMessage()}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
