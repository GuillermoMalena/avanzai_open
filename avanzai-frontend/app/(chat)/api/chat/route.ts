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
      console.log(`[${new Date().toISOString()}][STREAM-DEBUG] Starting data stream response for chat:`, id);

      // Using try-finally to ensure DB connection is properly managed
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
          ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
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
          },
          onFinish: async ({ response, reasoning }) => {
            if (session.user?.id) {
              try {
                console.log(`[${new Date().toISOString()}][STREAM-DEBUG] Processing onFinish`);
                
                const sanitizedResponseMessages = sanitizeResponseMessages({
                  messages: response.messages,
                  reasoning,
                });

                if (sanitizedResponseMessages.length > 0) {
                  await saveMessages({
                    messages: sanitizedResponseMessages.map((message) => ({
                      id: message.id,
                      chatId: id,
                      role: message.role,
                      content: message.content,
                      createdAt: new Date(),
                    })),
                  });
                }
              } catch (error) {
                console.error(`[${new Date().toISOString()}][STREAM-DEBUG] Error in onFinish:`, error);
              }
            }
          },
          experimental_telemetry: {
            isEnabled: true,
            functionId: 'stream-text',
          },
        });

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      } finally {
        // Release the connection back to the pool when the stream finishes
        releaseConnection().catch(err => {
          console.error('Error releasing connection back to pool after stream completion:', err);
        });
      }
    },
    onError: (error: any) => {
      console.error(`[${new Date().toISOString()}][STREAM-DEBUG] Error in data stream:`, error);
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
