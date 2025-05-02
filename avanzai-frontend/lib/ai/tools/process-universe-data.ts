/**
 * AI Tool for processing universe data and creating financial artifacts
 */
import { DataStreamWriter, Tool, tool } from 'ai';
import { z } from 'zod';
import { Session } from 'next-auth';
import { generateUUID } from '@/lib/utils';
import { fetchUniverseData } from '@/lib/api/financial-api';
import { handleUniverseQuery } from '@/lib/ai/tools/process-financial-data';
import { saveDocument } from '@/lib/db/queries';
import { 
  FinancialMetadata,
  UniverseDataResponse
} from '@/lib/models/financial-data';

interface ProcessUniverseDataProps {
  session: Session;
  dataStream: DataStreamWriter;
  chatId: string;
}

/**
 * Tool for processing universe ranking data and creating visualizations
 */
export const processUniverseData = ({ session, dataStream, chatId }: ProcessUniverseDataProps) =>
  tool({
    description: 'Process universe ranking data for top performing stocks visualization',
    parameters: z.object({
      query: z.string().describe('The complete query asking about top/bottom performing stocks or rankings (e.g., "What are the top 10 performing stocks?", "Show me the worst 5 stocks this month")'),
      chatId: z.string().describe('Chat ID for document association')
    }),
    execute: async ({ query, chatId: providedChatId }) => {
      // Use the provided chatId from props if no specific one is provided in the call
      const id = providedChatId || chatId;
      
      console.log(`🚀 Executing processUniverseData tool: query="${query}", chatId=${id}`);
      
      try {
        // 1. Initialize document
        console.log(`📝 Using document ID: ${id}`);
        
        // 2. Set initial stream data - THIS SETS UP THE ARTIFACT
        console.log(`🔄 Setting up artifact data stream - kind:financial, id:${id}`);
        dataStream.writeData({ type: 'kind', content: 'financial' });
        dataStream.writeData({ type: 'chatId', content: id });
        dataStream.writeData({ type: 'id', content: id });
        dataStream.writeData({ type: 'title', content: `Universe Ranking: ${query}` });
        
        // 3. Set loading state
        console.log(`🔄 Setting initial loading state`);
        dataStream.writeData({
          type: 'financial-tool-status',
          content: { 
            tool: 'processUniverseData',
            status: 'loading',
            visualizationReady: false,
            chatId: id
          }
        });
        
        // 4. Call API
        console.log(`📡 Calling universe API...`);
        const userId = session.user?.id || 'anonymous';
        const sessionId = session.user?.id || id; // Use user ID if available, otherwise use document ID

        try {
          const params = {
            query,
            session_id: sessionId
          };
          
          // Fetch universe data from API
          const universeData = await fetchUniverseData(params);
          
          // Process the universe data
          console.log(`📊 Processing universe data for ${universeData.data.length} tickers`);
          
          // Create metadata object
          const finalMetadata: FinancialMetadata = {
            status: 'ready',
            sessionId: sessionId,
            universeData: universeData,
            visualizationReady: true
          };
          
          // Update status with universe data info
          dataStream.writeData({
            type: 'financial-tool-status',
            content: {
              tool: 'processUniverseData',
              status: 'ready',
              universeData: {
                metric: universeData.metadata.metric,
                sort: universeData.metadata.sort,
                length: universeData.metadata.length,
                rowCount: universeData.metadata.row_count
              }
            }
          });
          
          // Save document with final metadata
          await saveDocument({
            chatId: id,
            id: id,
            title: `Universe Ranking: ${query}`,
            kind: 'financial',
            userId: session.user?.id || 'anonymous',
            content: JSON.stringify(finalMetadata),
          });
          
          // Send finish signal
          dataStream.writeData({ type: 'finish', content: '' });
          
          return {
            kind: 'financial',
            chatId: id,
            success: true,
            message: `Successfully processed universe ranking data for: "${query}"`,
            data: {
              universeData: universeData,
              metadata: finalMetadata
            }
          };
          
        } catch (error: any) {
          console.error(`❌ Tool execution error: ${error.message}`);
          
          const errorMetadata: FinancialMetadata = {
            status: 'error',
            error: error.message
          };
          
          // Try to save error state to document
          try {
            console.log(`💾 Saving error document to database for exception: id=${id}`);
            await saveDocument({
              chatId: id,
              id: id,
              title: `Universe Ranking: ${query}`,
              kind: 'financial',
              userId: session.user?.id || 'anonymous',
              content: JSON.stringify(errorMetadata),
            });
          } catch (saveError) {
            console.error(`❌ Failed to save error document:`, saveError);
          }
          
          // Send detailed error status
          console.log(`🔄 Sending error status to client for exception`);
          dataStream.writeData({
            type: 'financial-tool-status',
            content: {
              tool: 'processUniverseData',
              status: 'error',
              error: error.message
            }
          });
          
          // Send finish signal
          console.log(`🏁 Sending finish signal for exception state`);
          dataStream.writeData({ type: 'finish', content: '' });
          
          return {
            error: error.message
          };
        }

      } catch (error: any) {
        console.error('Error processing universe data:', error);
        const errorMetadata: FinancialMetadata = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error instanceof Error ? error.stack : undefined
        };
        
        return {
          kind: 'financial',
          error: {
            code: 'UNIVERSE_DATA_ERROR',
            message: errorMetadata.error,
            details: errorMetadata.details
          },
          metadata: errorMetadata
        };
      }
    }
  }); 