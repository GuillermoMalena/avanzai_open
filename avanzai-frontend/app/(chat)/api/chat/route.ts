import {
  type Message,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from 'ai';

import { auth } from '@/app/(auth)/auth';
import { myProvider } from '@/lib/ai/models';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
  createChatWithTemplates,
  saveDocument,
  getDocumentById,
  getDocumentsByChatId,
  releaseConnection,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';
import { documentHandlersByArtifactKind } from '@/lib/artifacts/registry';

import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { processFinancialData } from '@/lib/ai/tools/process-financial-data';
import { getNews } from '@/lib/ai/tools/get-news';
import { defaultTemplates } from '@/templates';
import { withDbCleanup } from '@/lib/db-middleware';

export const maxDuration = 60;

// Wrap with DB cleanup to ensure connections are properly closed after use
export const POST = withDbCleanup(async (request: Request) => {
  const {
    id,
    messages,
    selectedChatModel,
  }: { id: string; messages: Array<Message>; selectedChatModel: string } =
    await request.json();

  // Add tool response tracking
  let receivedFirstChunk = false;
  const toolCallCache = new Set<string>();

  const shouldExecuteToolCall = (toolName: string, params: any): boolean => {
    const key = JSON.stringify({ toolName, params });
    if (toolCallCache.has(key)) {
      return false;
    }
    toolCallCache.add(key);
    return true;
  };

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userMessage = getMostRecentUserMessage(messages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  // Check if this is a new chat
  const chat = await getChatById({ id });
  const isFirstMessage = !chat;

  if (isFirstMessage) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    
    // Create chat with empty templates object
    await createChatWithTemplates({ 
      id, 
      userId: session.user.id, 
      title,
      templates: {}  // Initialize with empty templates
    });
  }

  await saveMessages({
    messages: [{ ...userMessage, createdAt: new Date(), chatId: id }],
  });

  return createDataStreamResponse({
    execute: async (dataStream) => {
      try {
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: systemPrompt({ selectedChatModel }),
          messages,
          maxSteps: 5,
          experimental_activeTools: [
            'getWeather',
            'createDocument',
            'updateDocument',
            'requestSuggestions',
            'processFinancialData',
            'getNews',
          ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          onChunk: (event) => {
            const isToolCall = event.chunk.type === 'tool-call';
            if (!receivedFirstChunk && !isToolCall) {
              receivedFirstChunk = true;
              dataStream.writeMessageAnnotation({
                type: 'status',
                value: 'processing'
              });
            }
          },
          tools: {
            getWeather,
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({
              session,
              dataStream,
            }),
            processFinancialData: processFinancialData({
              session,
              dataStream,
              chatId: id
            }),
            getNews: getNews({
              session,
              dataStream,
              chatId: id
            }),
          },
          onFinish: async ({ response, reasoning }) => {
            if (session.user?.id) {
              try {
                const sanitizedResponseMessages = sanitizeResponseMessages(response.messages);

                if (sanitizedResponseMessages.length > 0) {
                  await saveMessages({
                    messages: sanitizedResponseMessages.map((message) => ({
                      id: generateUUID(),
                      chatId: id,
                      role: message.role,
                      content: message.content,
                      createdAt: new Date(),
                    })),
                  });
                }
              } catch (error) {
                // Silent error handling for message saving
              }
            }
          },
          experimental_telemetry: {
            isEnabled: true,
            functionId: 'stream-text',
          },
        });
        result.mergeIntoDataStream(dataStream);
      } finally {
        releaseConnection().catch(() => {
          // Silent error handling for connection release
        });
      }
    },
    onError: () => {
      return 'Oops, an error occurred!';
    },
  });
});

export const DELETE = withDbCleanup(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
});
