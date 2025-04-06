import { createDocumentHandler } from '@/lib/artifacts/server';

const imageDocumentHandler = createDocumentHandler({
  kind: 'image',
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

export default imageDocumentHandler;
