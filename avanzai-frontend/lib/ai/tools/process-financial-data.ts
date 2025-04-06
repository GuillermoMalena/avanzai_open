/**
 * AI Tool for processing financial data and creating financial artifacts
 */
import { DataStreamWriter, Tool, tool } from 'ai';
import { z } from 'zod';
import { Session } from 'next-auth';
import { generateUUID } from '@/lib/utils';
import { fetchFinancialData } from '@/lib/api/financial-api';
import { fetchParquetData, parseParquetToTimeSeriesData, convertToLegacyFormat } from '@/lib/api/parquet-fetcher';
import { saveDocument } from '@/lib/db/queries';
import { 
  FinancialMetadata, 
  ProcessedTimeSeriesData,
  ParquetDataResponse 
} from '@/lib/models/financial-data';

interface ProcessFinancialDataProps {
  session: Session;
  dataStream: DataStreamWriter;
  chatId: string;
}

/**
 * Tool for processing financial time series data and creating visualizations
 */
export const processFinancialData = ({ session, dataStream, chatId }: ProcessFinancialDataProps) =>
  tool({
    description: 'Process financial time series data for price visualization based on a ticker symbol or company name',
    parameters: z.object({
      query: z.string().describe('Financial query or ticker symbol (e.g., "AAPL", "Apple stock", "Microsoft price")'),
      timeRange: z.string().optional().describe('Time range for data (e.g., "1d", "1w", "1m", "1y")'),
      chatId: z.string().optional().describe('Optional chat ID for document association')
    }),
    execute: async ({ query, timeRange = '1y', chatId: providedChatId }) => {
      // Use the provided chatId from props if no specific one is provided in the call
      const id = providedChatId || chatId;
      
      console.log(`🚀 Executing processFinancialData tool: query=${query}, timeRange=${timeRange}, chatId=${id}`);
      
      try {
        // 1. Initialize document
        console.log(`📝 Using document ID: ${id}`);
        
        // 2. Set initial stream data - THIS SETS UP THE ARTIFACT
        console.log(`🔄 Setting up artifact data stream - kind:financial, id:${id}`);
        dataStream.writeData({ type: 'kind', content: 'financial' });
        dataStream.writeData({ type: 'chatId', content: id });
        dataStream.writeData({ type: 'id', content: id });
        dataStream.writeData({ type: 'title', content: `Financial Data: ${query}` });
        
        // 3. Set loading state
        console.log(`🔄 Setting initial loading state`);
        dataStream.writeData({
          type: 'financial_status',
          content: { 
            status: 'loading',
            visualizationReady: false,
            chatId: id
          }
        });
        
        // 4. Call API with retry options
        console.log(`📡 Calling financial API...`);
        const userId = session.user?.id || 'anonymous';
        const sessionId = session.user?.id || id; // Use user ID if available, otherwise use document ID

        try {
          const apiResponse = await fetchFinancialData(query, timeRange, sessionId, {
            maxRetries: 3,
            timeoutMs: 30000, // 30 seconds
            retryDelayMs: 2000 // Start with 2 second delay
          });

          // 5. Handle errors
          if (apiResponse.status !== 'success') {
            console.error(`❌ API returned error status: ${apiResponse.status}`, apiResponse.error);
            
            // Create error document record to ensure it's tracked
            const errorMetadata: FinancialMetadata = {
              status: 'error',
              error: apiResponse.error?.message || 'Failed to fetch financial data'
            };
            
            // Save the document with error state
            console.log(`💾 Saving error document state to database: id=${id}`);
            await saveDocument({
              chatId: id,
              title: `Financial Data: ${query}`,
              kind: 'financial',
              userId: session.user?.id || 'anonymous',
              content: JSON.stringify(errorMetadata),
            });
            
            // Send detailed error status to client
            console.log(`🔄 Sending error status to client`);
            dataStream.writeData({
              type: 'financial_status',
              content: {
                status: 'error', 
                error: apiResponse.error?.message || 'Failed to fetch financial data',
                details: apiResponse.error?.details || null
              }
            });
            
            // Send finish signal
            dataStream.writeData({ type: 'finish', content: '' });
            
            return {
              error: apiResponse.error?.message || 'Failed to fetch financial data'
            };
          }
          
          // 6. Detect which API response format we're dealing with and handle accordingly
          // New API format (with tickers, session_id, and presigned_url)
          if (apiResponse.tickers && apiResponse.result_path && apiResponse.presigned_url) {
            console.log(`✅ Detected new API format with tickers: [${apiResponse.tickers.join(', ')}]`);
            return await handleNewApiFormat(id, apiResponse);
          } 
          // Legacy API format (with query.symbol and data)
          else if (apiResponse.query?.symbol && apiResponse.data) {
            console.log(`✅ Detected legacy API format with symbol: ${apiResponse.query.symbol}`);
            return await handleLegacyFormat(id, apiResponse);
          } 
          // Unsupported format
          else {
            throw new Error('Unsupported API response format');
          }

        } catch (error: any) {
          console.error(`❌ Tool execution error: ${error.message}`);
          
          // Determine if this was a timeout
          const isTimeout = error.message.includes('timeout') || error.name === 'AbortError';
          
          const errorMetadata: FinancialMetadata = {
            status: 'error',
            error: error.message,
            isTimeout: isTimeout
          };
          
          // Try to save error state to document
          try {
            console.log(`💾 Saving error document to database for exception: id=${id}`);
            await saveDocument({
              chatId: id,
              title: `Financial Data: ${query}`,
              kind: 'financial',
              userId: session.user?.id || 'anonymous',
              content: JSON.stringify(errorMetadata),
            });
          } catch (saveError) {
            console.error(`❌ Failed to save error document:`, saveError);
          }
          
          // Send detailed error status with retry information
          console.log(`🔄 Sending error status to client for exception`);
          dataStream.writeData({
            type: 'financial_status',
            content: {
              status: 'error',
              error: error.message,
              isTimeout: isTimeout,
              details: isTimeout ? 
                'The request timed out. This might be due to high server load or network issues.' :
                'An unexpected error occurred while fetching financial data.'
            }
          });
          
          // Send finish signal
          console.log(`🏁 Sending finish signal for exception state`);
          dataStream.writeData({ type: 'finish', content: '' });
          
          return {
            error: error.message,
            isTimeout: isTimeout
          };
        }

      } catch (error: any) {
        console.error('Error processing financial data:', error);
        const errorMetadata: FinancialMetadata = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error instanceof Error ? error.stack : undefined,
          isTimeout: false // Set to false since this is a general error, not a timeout
        };
        return {
          kind: 'financial',
          error: {
            code: 'FINANCIAL_DATA_ERROR',
            message: errorMetadata.error,
            details: errorMetadata.details
          },
          metadata: errorMetadata
        };
      }
      
      // Handler for new API format with presigned URL
      async function handleNewApiFormat(id: string, apiResponse: any) {
        // Create processing metadata
        const processingMetadata: FinancialMetadata = {
          status: 'fetching_parquet',
          tickers: apiResponse.tickers,
          sessionId: apiResponse.session_id,
          resultPath: apiResponse.result_path,
          presignedUrl: apiResponse.presigned_url,
          timeSeriesData: []  // Initialize with empty array
        };
        
        // Save document record with processing metadata
        console.log(`💾 Saving initial document to database: id=${id}, tickers=${apiResponse.tickers.join(', ')}`);
        await saveDocument({
          chatId: id,
          title: `Financial Data: ${apiResponse.tickers.join(', ')}`,
          kind: 'financial',
          userId: session.user?.id || 'anonymous',
          content: JSON.stringify(processingMetadata),
        });
        
        // Update status with processing info
        dataStream.writeData({
          type: 'financial_status',
          content: {
            status: 'fetching_parquet',
            tickers: apiResponse.tickers,
            sessionId: apiResponse.session_id,
            resultPath: apiResponse.result_path,
            presignedUrl: apiResponse.presigned_url
          }
        });
        
        // Fetch parquet data
        try {
          console.log(`📊 Fetching parquet data from presigned URL`);
          
          // Inform client we're now fetching parquet data
          dataStream.writeData({
            type: 'financial_status',
            content: { 
              status: 'processing',
              message: 'Fetching and processing parquet data...'
            }
          });
          
          if (!apiResponse.presigned_url) {
            throw new Error('No presigned URL provided in API response');
          }
          
          const parquetData = await fetchParquetData(apiResponse.presigned_url);
          
          // Process parquet data into time series format
          console.log(`🔄 Processing parquet data for tickers: [${apiResponse.tickers.join(', ')}]`);
          const timeSeriesData = parseParquetToTimeSeriesData(parquetData, apiResponse.tickers);
          
          // For multi-ticker support, we'll send each ticker's data separately
          for (const ticker of apiResponse.tickers) {
            if (timeSeriesData[ticker] && timeSeriesData[ticker].length > 0) {
              console.log(`📤 Streaming data for ticker: ${ticker}, points: ${timeSeriesData[ticker].length}`);
              
              // Convert ProcessedTimeSeriesData to JSONValue compatible format
              const jsonCompatibleData = timeSeriesData[ticker].map((point: ProcessedTimeSeriesData) => ({
                timestamp: point.timestamp,
                value: point.value
              }));
              
              dataStream.writeData({
                type: 'financial_ticker_data',
                content: {
                  ticker,
                  data: jsonCompatibleData
                }
              });
            }
          }
          
          // Create legacy format data for backward compatibility
          const legacyData = convertToLegacyFormat(timeSeriesData, apiResponse.tickers[0]);
          
          // Create final metadata with ready state
          const totalDataPoints = Object.values(timeSeriesData).reduce((sum, data) => sum + data.length, 0);
          
          const finalMetadata: FinancialMetadata = {
            status: 'ready',
            tickers: apiResponse.tickers,
            sessionId: apiResponse.session_id,
            resultPath: apiResponse.result_path,
            presignedUrl: apiResponse.presigned_url,
            timeSeriesData: legacyData, // Use legacy format for backward compatibility
            tickerData: timeSeriesData, // Store per-ticker data
            dataPoints: totalDataPoints,
            loadedPoints: totalDataPoints,
            visualizationReady: true
          };
          
          // Update document with final metadata
          await saveDocument({
            chatId: id,
            title: `Financial Data: ${apiResponse.tickers.join(', ')}`,
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
            message: `Successfully processed data for tickers: ${apiResponse.tickers.join(', ')}`,
            data: {
              tickers: apiResponse.tickers,
              start_date: apiResponse.start_date,
              end_date: apiResponse.end_date,
              cumulative_returns: apiResponse.cumulative_returns,
              session_id: apiResponse.session_id,
              timestamp: apiResponse.timestamp,
              result_path: apiResponse.result_path,
              timeSeriesData: timeSeriesData,
              metadata: finalMetadata
            }
          };
        } catch (error: any) {
          console.error(`❌ Error fetching/processing parquet data:`, error);
          throw error;
        }
      }
      
      // Handler for legacy API format
      async function handleLegacyFormat(id: string, apiResponse: any) {
        const symbol = apiResponse.query.symbol;
        
        // Create initial metadata
        const processingMetadata: FinancialMetadata = {
          status: 'processing',
          symbol: symbol,
          metrics: apiResponse.query.metrics,
          dataId: apiResponse.metadata?.dataId,
          sessionId: apiResponse.metadata?.sessionId,
          dataPoints: apiResponse.data?.length || 0,
          loadedPoints: 0,
          timeSeriesData: []  // Initialize with empty array
        };
        
        // Save document record with initial metadata
        console.log(`💾 Saving initial document to database: id=${id}, symbol=${symbol}`);
        await saveDocument({
          chatId: id,
          title: `Financial Data: ${symbol}`,
          kind: 'financial',
          userId: session.user?.id || 'anonymous',
          content: JSON.stringify(processingMetadata),
        });
        
        // Update status with JSONValue compatible object
        console.log(`🔄 Sending processing status to client`);
        dataStream.writeData({
          type: 'financial_status',
          content: {
            status: 'processing',
            symbol: symbol,
            metrics: apiResponse.query.metrics,
            dataId: apiResponse.metadata?.dataId,
            sessionId: apiResponse.metadata?.sessionId,
            dataPoints: apiResponse.data?.length || 0,
            loadedPoints: 0
          }
        });
        
        // Transform and stream data
        console.log(`📊 Processing ${apiResponse.data?.length || 0} data points...`);
        const processedData = apiResponse.data?.map((item: { date: string; [key: string]: string | number }) => ({
          timestamp: item.date,
          value: parseFloat(String(item[symbol]))
        })).filter((item: { timestamp: string; value: number }) => !isNaN(item.value)) || [];
        
        // Stream in chunks for progress indication
        const chunkSize = 100;
        for (let i = 0; i < processedData.length; i += chunkSize) {
          const chunk = processedData.slice(i, i + chunkSize);
          
          dataStream.writeData({
            type: 'financial_data_chunk',
            content: chunk
          });
          
          dataStream.writeData({
            type: 'financial_status',
            content: { 
              loadedPoints: Math.min(i + chunk.length, processedData.length)
            }
          });
          
          // Small delay to prevent UI blocking
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        // Create final metadata with ready state
        const finalMetadata: FinancialMetadata = {
          status: 'ready',
          symbol: symbol,
          metrics: apiResponse.query.metrics,
          dataId: apiResponse.metadata?.dataId,
          sessionId: apiResponse.metadata?.sessionId,
          dataPoints: apiResponse.data?.length || 0,
          loadedPoints: processedData.length,
          timeSeriesData: processedData,
          tickers: [symbol],
          tickerData: { [symbol]: processedData },
          visualizationReady: true
        };
        
        // Save final document state
        await saveDocument({
          chatId: id,
          title: `Financial Data: ${symbol}`,
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
          message: `Successfully processed data for symbol: ${symbol}`,
          data: {
            symbol: symbol,
            metrics: apiResponse.query.metrics,
            timeSeriesData: processedData,
            metadata: finalMetadata,
            dataPoints: apiResponse.data?.length || 0,
            sessionId: apiResponse.metadata?.sessionId,
            start_date: processedData[0]?.timestamp,
            end_date: processedData[processedData.length - 1]?.timestamp,
            cumulative_returns: processedData.length > 0 ? {
              [symbol]: ((processedData[processedData.length - 1].value / processedData[0].value) - 1) * 100
            } : undefined
          }
        };
      }
    }
  }); 