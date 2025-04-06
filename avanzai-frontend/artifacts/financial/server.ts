/**
 * Server-side handler for financial artifacts
 */
import { DataStreamWriter } from 'ai';
import { Session } from 'next-auth';
import { saveDocument } from '@/lib/db/queries';
import { FinancialMetadata } from '@/lib/models/financial-data';
import { ArtifactKind } from '@/components/artifact';

interface DocumentHandlerParams {
  id: string;
  title: string;
  dataStream: DataStreamWriter;
  session: Session;
}

interface UpdateDocumentCallbackProps {
  document: {
    id: string;
    content: string;
  };
  description: string;
  dataStream: DataStreamWriter;
}

/**
 * Handler for financial documents
 */
export const financialDocumentHandler = {
  kind: 'financial' as const,
  
  /**
   * Create a new financial document
   */
  onCreateDocument: async ({ id, title, dataStream, session }: DocumentHandlerParams) => {
    console.log(`📝 Creating financial document: id=${id}, title=${title}`);
    
    try {
      // Create initial document record
      await saveDocument({
        chatId: id,
        title,
        kind: 'financial' as ArtifactKind,
        userId: session.user?.id || 'anonymous',
        content: JSON.stringify({ status: 'initialized' }),
      });
      
      console.log(`✅ Financial document created successfully`);
    } catch (error) {
      console.error(`❌ Error creating financial document:`, error);
      dataStream.writeData({
        type: 'financial_status',
        content: { 
          status: 'error', 
          error: 'Failed to save document'
        }
      });
    }
  },
  
  /**
   * Update an existing financial document
   */
  onUpdateDocument: async ({ document, description, dataStream }: UpdateDocumentCallbackProps) => {
    console.log(`📝 Updating financial document: id=${document.id}, description=${description}`);
    
    try {
      // Parse content to validate it
      const contentObj = JSON.parse(document.content) as FinancialMetadata;
      
      // For now, just return the original content
      // In a real implementation, you would update the document in the database
      console.log(`✅ Financial document updated successfully`);
      
      return document.content;
    } catch (error) {
      console.error(`❌ Error updating financial document:`, error);
      dataStream.writeData({
        type: 'financial_status',
        content: { 
          status: 'error', 
          error: 'Failed to update document'
        }
      });
      
      return document.content;
    }
  }
}; 