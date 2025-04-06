import { z } from 'zod';
import { streamObject } from 'ai';
import { myProvider } from '@/lib/ai/models';
import { codePrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import { createDocumentHandler } from '@/lib/artifacts/server';

const codeDocumentHandler = createDocumentHandler({
  kind: 'code',
  onCreateDocument: async ({ id, title, dataStream }) => {
    // Initialize with empty content
    dataStream.writeData({
      type: 'content-update',
      content: '',
    });
    return '';
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    // Stream the current content
    dataStream.writeData({
      type: 'content-update',
      content: document.content || '',
    });
    return document.content || '';
  },
});

export default codeDocumentHandler;
