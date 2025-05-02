import {
  type Message,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from 'ai';

import { auth } from '@/app/(auth)/auth';
import { myProvider, DEFAULT_CHAT_MODEL, REASONING_MODEL, MAIN_MODEL } from '@/lib/ai/models';
import { systemPrompt, reasoningPrompt } from '@/lib/ai/prompts';
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
  getUser,
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
import { processFinancialData, processUniverseData } from '@/lib/ai/tools/index';
import { getNews } from '@/lib/ai/tools/get-news';
import { defaultTemplates } from '@/templates';
import { withDbCleanup } from '@/lib/db-middleware';
import { createServerComponentClient } from '@/lib/supabase/server-client';

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

  // Get NextAuth session
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Add detailed session debugging
  console.log(`DEBUG AUTH SESSION: 
- NextAuth Session: ${JSON.stringify({
  userId: session.user.id,
  email: session.user.email,
  name: session.user.name,
  expires: session.expires
}, null, 2)}`);

  // Get Supabase user ID - this is the ID we want to use for creating chats
  let supabaseUserId = null;
  try {
    const supabase = await createServerComponentClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    
    if (supabaseUser) {
      console.log('Using Supabase user ID for chat:', supabaseUser.id);
      console.log(`DEBUG SUPABASE USER: ${JSON.stringify({
        id: supabaseUser.id,
        email: supabaseUser.email
      }, null, 2)}`);
      supabaseUserId = supabaseUser.id;
    } else {
      console.log('No Supabase user found, falling back to NextAuth ID');
    }
  } catch (error) {
    console.error('Error getting Supabase user:', error);
  }

  // Use Supabase ID if available, otherwise fall back to NextAuth ID
  const effectiveUserId = supabaseUserId || session.user.id;
  console.log(`DEBUG EFFECTIVE USER: 
- Effective user ID: ${effectiveUserId}
- Source: ${supabaseUserId ? 'Supabase' : 'NextAuth'}
- Will be used for: Chat creation only (NOT for financial API calls)`);

  const userMessage = getMostRecentUserMessage(messages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  // Check if this is a new chat
  const chat = await getChatById({ id });
  const isFirstMessage = !chat;

  if (isFirstMessage) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    
    // Create chat with empty templates object and the Supabase user ID
    await createChatWithTemplates({ 
      id, 
      userId: effectiveUserId,  // Use Supabase user ID 
      title,
      templates: {}  // Initialize with empty templates
    });
  }

  await saveMessages({
    messages: [{ ...userMessage, createdAt: new Date(), chatId: id }],
  });

  // Configure models - use reasoning middleware model for first stage
  const reasoningModel = REASONING_MODEL; // Use 'chat-model-reasoning' with middleware
  const mainModel = MAIN_MODEL; // Use 'chat-model-small' for main model

  console.log('[REASONING] Using reasoning model with middleware:', reasoningModel);
  console.log('[REASONING] Using main model:', mainModel);

  return createDataStreamResponse({
    execute: async (dataStream) => {
      try {
        // Variable to collect reasoning output
        let collectedReasoning = '';
        let isSimpleQuery = false;
        
        // Step 1: Process with reasoning model first - as regular text
        if (true) {
          console.log('[REASONING] Starting reasoning phase');
          
          // Create a promise to track when reasoning is complete
          let reasoningComplete = false;
          const reasoningFinished = new Promise<void>((resolve) => {
            // This will be called when reasoning is done
            const markReasoningComplete = () => {
              reasoningComplete = true;
              resolve();
            };
            
            // First message ID for the reasoning phase
            const reasoningMessageId = generateUUID();
            console.log('[REASONING] Reasoning message ID:', reasoningMessageId);
            
            // Create first message with reasoning
            const reasoningResult = streamText({
              model: myProvider.languageModel(reasoningModel),
              system: reasoningPrompt(),
              messages,
              experimental_transform: smoothStream({ chunking: 'word' }),
              onChunk: (event) => {
                // Log all chunk types for debugging
                console.log('[REASONING] Chunk type:', event.chunk.type);
                
                // For text or reasoning chunks, collect them
                if (event.chunk.type === 'text-delta' || event.chunk.type === 'reasoning') {
                  // For reasoning chunks, extract the reasoning content
                  if (event.chunk.type === 'reasoning') {
                    // Remove: console.log('[REASONING] Got reasoning chunk');
                    
                    // Add reasoning to our collected reasoning 
                    const reasoningText = 'textDelta' in event.chunk ? event.chunk.textDelta : '';
                    collectedReasoning += reasoningText;
                    
                    // Check if this is a simple query based on the marker
                    if (reasoningText.includes('SIMPLE_QUERY:')) {
                      isSimpleQuery = true;
                      console.log('[REASONING] Detected simple query in reasoning chunk');
                    }
                  } else {
                    // For normal text chunks, also collect them
                    console.log('[REASONING] Got text chunk');
                    const textChunk = event.chunk.textDelta;
                    collectedReasoning += textChunk;
                  }
                  
                  // Status for first chunk - send a special reasoning event on first chunk
                  if (!receivedFirstChunk) {
                    receivedFirstChunk = true;
                    
                    // Write a special message annotation to signal reasoning is starting
                    dataStream.writeMessageAnnotation({
                      type: 'status',
                      value: 'reasoning-start'
                    });
                    
                    // Also send an initial reasoning part to ensure the UI updates immediately
                    dataStream.writeMessageAnnotation({
                      type: 'reasoning-chunk',
                      value: 'Thinking...' // Initial placeholder content
                    });
                    
                    console.log('[REASONING] Sent reasoning-start annotation - isReasoning should be TRUE');
                  }
                  
                  // IMPORTANT: Use annotations to send reasoning information
                  // This approach uses the supported API instead of writeMessagePart
                  try {
                    // Send reasoning content as a custom annotation that the UI can interpret
                    dataStream.writeMessageAnnotation({
                      type: 'reasoning-chunk',
                      value: collectedReasoning // Current reasoning content
                    });
                    // Remove: console.log('[REASONING] Wrote reasoning annotation');
                  } catch (error) {
                    console.error('[REASONING] Error writing reasoning annotation:', error);
                  }
                }
              },
              onFinish: ({ reasoning, response }) => {
                console.log('[REASONING] Finished reasoning phase');
                console.log('[REASONING] Final reasoning available:', !!reasoning);
                
                // If we have explicit reasoning from the middleware, use that
                if (reasoning) {
                  // Add the final reasoning chunk
                  collectedReasoning += reasoning;
                  
                  // Check if this is a simple query based on the marker
                  if (reasoning.includes('SIMPLE_QUERY:')) {
                    isSimpleQuery = true;
                    console.log('[REASONING] Detected simple query in final reasoning');
                  }
                }
                
                // For simple queries, extract just the essential reasoning after the marker
                if (isSimpleQuery) {
                  const markerIndex = collectedReasoning.indexOf('SIMPLE_QUERY:');
                  if (markerIndex !== -1) {
                    const simplifiedReasoning = collectedReasoning.substring(markerIndex).trim();
                    collectedReasoning = simplifiedReasoning;
                    console.log('[REASONING] Simplified reasoning to:', collectedReasoning.substring(0, 100) + '...');
                  }
                }
                
                console.log('[REASONING] Collected reasoning length:', collectedReasoning.length);
                console.log('[REASONING] Reasoning sample:', collectedReasoning.substring(0, 100) + '...');
                
                // Mark reasoning as complete
                markReasoningComplete();
              }
            });
            
            // Stream reasoning result to client (this is still needed for the content)
            console.log('[REASONING] Using mergeIntoDataStream with sendReasoning=true');
            reasoningResult.mergeIntoDataStream(dataStream, {
              sendReasoning: true
            });

            // If for some reason onFinish doesn't get called, resolve after 30 seconds
            setTimeout(() => {
              if (!reasoningComplete) {
                console.log('[REASONING] Forcing reasoning completion after timeout');
                markReasoningComplete();
              }
            }, 30000);
          });
          
          // Wait for reasoning to finish before starting main model
          console.log('[REASONING] Waiting for reasoning to complete...');
          await reasoningFinished;
          console.log('[REASONING] Reasoning complete, continuing to main model');
          
          // Add visual separator between phases
          dataStream.writeMessageAnnotation({
            type: 'status',
            value: 'reasoning-complete'
          });
          console.log('[REASONING] Sent reasoning-complete annotation - isReasoning should be FALSE');
        }
        
        // Reset first chunk tracking for main model
        receivedFirstChunk = false;
        
        // Step 2: Process with main model using the collected reasoning
        console.log('[REASONING] Starting main response phase');
        
        const mainResult = streamText({
          model: myProvider.languageModel(mainModel),
          system: systemPrompt({ 
            selectedChatModel: mainModel,
            reasoning: collectedReasoning // Pass collected reasoning to prompt
          }),
          messages,
          maxSteps: 5,
          experimental_activeTools: [
            'getWeather',
            'createDocument',
            'updateDocument',
            'requestSuggestions',
            'processFinancialData',
            'processUniverseData',
            'getNews',
          ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          onChunk: (event) => {
            const isToolCall = event.chunk.type === 'tool-call';
            if (!receivedFirstChunk && !isToolCall) {
              receivedFirstChunk = true;
              dataStream.writeMessageAnnotation({
                type: 'status',
                value: 'responding'
              });
              console.log('[REASONING] Sent responding annotation - isReasoning should STAY FALSE');
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
            processUniverseData: processUniverseData({
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
          onFinish: async ({ response }) => {
            console.log('[REASONING] Main response phase finished');
            
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

        // Stream main model result to client
        console.log('[REASONING] Streaming main response');
        mainResult.mergeIntoDataStream(dataStream);
      } finally {
        releaseConnection().catch(() => {
          // Silent error handling for connection release
        });
      }
    },
    onError: (error) => {
      console.error('[REASONING] Error in stream:', error);
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
