import { openai } from '@ai-sdk/openai';
import { fireworks } from '@ai-sdk/fireworks';
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';

export const DEFAULT_CHAT_MODEL: string = 'chat-model-reasoning';
export const REASONING_MODEL: string = 'chat-model-reasoning'; // Using middleware-wrapped model for reasoning
export const MAIN_MODEL: string = 'chat-model-small'; // Main model (o4-mini)

// Apply reasoning middleware to create a reasoning-focused model
// This is critical for formatting the output for the ReasoningMessagePart component
const reasoningWrappedModel = wrapLanguageModel({
  model: openai('gpt-4o-2024-11-20'), // Using GPT-4.1 for better reasoning
  middleware: extractReasoningMiddleware({
    // Use standard think tag for reasoning extraction
    tagName: 'think',
  }),
});

export const myProvider = customProvider({
  languageModels: {
    'chat-model-small': openai('gpt-4o-mini'), // Main model for regular responses
    'chat-model-large': openai('gpt-4o-2024-11-20'),
    'chat-model-reasoning': reasoningWrappedModel, // Use wrapped model with reasoning middleware
    'title-model': openai('gpt-4-turbo'),
    'artifact-model': openai('o4-mini'),
  },
  imageModels: {
    'small-model': openai.image('dall-e-2'),
    'large-model': openai.image('dall-e-3'),
  },
});

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model-small',
    name: 'Small model',
    description: 'Small model for fast, lightweight tasks',
  },
  {
    id: 'chat-model-large',
    name: 'Large model',
    description: 'Large model for complex, multi-step tasks',
  },
];
