import { createDocumentHandler } from '@/lib/artifacts/server';
import { getDocumentById } from '@/lib/db/queries';

const sheetDocumentHandler = createDocumentHandler({
  kind: 'sheet',
  onCreateDocument: async ({ id, title, dataStream, session }) => {
    // Get the document content from the database
    const document = await getDocumentById({ id });
    
    if (document?.content) {
      // Stream the actual content
      dataStream.writeData({
        type: 'content-update',
        content: document.content,
      });
      return document.content;
    }

    // Return empty string if no content found
    return '';
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    // Stream the current content
    dataStream.writeData({
      type: 'content-update',
      content: document.content || '',
    });

    // Return current content
    return document.content || '';
  },
});

export default sheetDocumentHandler;
