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
  ParquetDataResponse,
  UniverseDataResponse,
  FundamentalDataResponse
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
          type: 'financial-tool-status',
          content: { 
            tool: 'processFinancialData',
            status: 'loading',
            visualizationReady: false,
            chatId: id
          }
        });
        
        // 4. Call API with retry options
        console.log(`📡 Calling financial API...`);
        const userId = session.user?.id || 'anonymous';
        const sessionId = session.user?.id || id; // Use user ID if available, otherwise use document ID

        // Generate a RFC4122-compliant UUID
        const generateConsistentUUID = (baseId: string) => {
          // Create namespace-based deterministic UUID (v5-like)
          const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // Standard DNS namespace UUID
          const input = baseId || 'default-user';
          
          // Convert namespace and input to byte arrays
          const hexToBytes = (hex: string): number[] => {
            const bytes = [];
            for (let i = 0; i < hex.length; i += 2) {
              bytes.push(parseInt(hex.substr(i, 2), 16));
            }
            return bytes;
          };
          
          const namespaceBytes = hexToBytes(namespace.replace(/-/g, ''));
          const inputBytes = [];
          for (let i = 0; i < input.length; i++) {
            inputBytes.push(input.charCodeAt(i));
          }
          
          // Simple hashing similar to SHA-1 for demonstration
          const hash = (data: number[]): number[] => {
            let h0 = 0x67452301;
            let h1 = 0xEFCDAB89;
            let h2 = 0x98BADCFE;
            let h3 = 0x10325476;
            let h4 = 0xC3D2E1F0;
            
            // Very simplified hash function
            for (let i = 0; i < data.length; i++) {
              h0 = ((h0 << 5) | (h0 >>> 27)) + data[i] + h4 + ((h1 & h2) | (~h1 & h3)) + 0x5A827999;
              h1 = ((h1 << 30) | (h1 >>> 2));
              [h0, h1, h2, h3, h4] = [h4, h0, h1, h2, h3];
            }
            
            // Convert to bytes
            const result: number[] = [];
            [h0, h1, h2, h3, h4].forEach(h => {
              result.push((h >>> 24) & 0xFF);
              result.push((h >>> 16) & 0xFF);
              result.push((h >>> 8) & 0xFF);
              result.push(h & 0xFF);
            });
            
            return result;
          };
          
          // Combine namespace and input for hashing
          const combinedData = [...namespaceBytes, ...inputBytes];
          const hashBytes = hash(combinedData);
          
          // Format as UUID
          // Set version (4 bits) to 5 (for namespaced UUID)
          hashBytes[6] = (hashBytes[6] & 0x0F) | 0x50;
          // Set variant (2 bits) to RFC4122: 0b10xx
          hashBytes[8] = (hashBytes[8] & 0x3F) | 0x80;
          
          // Format as string
          const byteToHex = (byte: number): string => {
            return ('0' + byte.toString(16)).slice(-2);
          };
          
          return [
            hashBytes.slice(0, 4).map(byteToHex).join(''),
            hashBytes.slice(4, 6).map(byteToHex).join(''),
            hashBytes.slice(6, 8).map(byteToHex).join(''),
            hashBytes.slice(8, 10).map(byteToHex).join(''),
            hashBytes.slice(10, 16).map(byteToHex).join('')
          ].join('-');
        };
        
        // Use the consistent UUID for API calls
        const apiSessionId = generateConsistentUUID(sessionId);

        // Add detailed logging about the session and sessionId
        console.log(`DEBUG SESSION INFO:
- Session user ID: ${session.user?.id}
- Chat ID: ${id}
- Original sessionId: ${sessionId}
- Generated API sessionId: ${apiSessionId}
- Session structure: ${JSON.stringify({
  userId: session.user?.id,
  email: session.user?.email,
  name: session.user?.name,
  expires: session.expires,
  sessionType: session.user?.id === sessionId ? 'Using user ID' : 'Fallback to chat ID'
}, null, 2)}
`);

        try {
          const apiResponse = await fetchFinancialData(query, timeRange, apiSessionId, {
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
              id: id,
              title: `Financial Data: ${query}`,
              kind: 'financial',
              userId: session.user?.id || 'anonymous',
              content: JSON.stringify(errorMetadata),
            });
            
            // Send detailed error status to client
            console.log(`🔄 Sending error status to client`);
            dataStream.writeData({
              type: 'financial-tool-status',
              content: {
                tool: 'processFinancialData',
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
            
            // Check if it's a fundamental data query by peeking at the data
            try {
              // Fetch initial data to determine the format
              const responseData = await fetch(apiResponse.presigned_url);
              const jsonData = await responseData.json();
              
              // Check if it looks like fundamental data (has fiscal_period or report_period fields)
              if (jsonData.data?.length > 0 && 
                  (jsonData.data[0]?.fiscal_period !== undefined || 
                   jsonData.data[0]?.report_period !== undefined)) {
                
                console.log(`✅ Detected fundamental data format`);
                return await handleFundamentalDataFormat(id, apiResponse);
              }
            } catch (error) {
              console.log(`❌ Error while checking data format: ${error}`);
              // Continue with standard processing if format check fails
            }
            
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
              id: id,
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
            type: 'financial-tool-status',
            content: {
              tool: 'processFinancialData',
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
          id: id,
          title: `Financial Data: ${apiResponse.tickers.join(', ')}`,
          kind: 'financial',
          userId: session.user?.id || 'anonymous',
          content: JSON.stringify(processingMetadata),
        });
        
        // Update status with processing info
        dataStream.writeData({
          type: 'financial-tool-status',
          content: {
            tool: 'processFinancialData',
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
            type: 'financial-tool-status',
            content: { 
              tool: 'processFinancialData',
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
            id: id,
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
          id: id,
          title: `Financial Data: ${symbol}`,
          kind: 'financial',
          userId: session.user?.id || 'anonymous',
          content: JSON.stringify(processingMetadata),
        });
        
        // Update status with JSONValue compatible object
        console.log(`🔄 Sending processing status to client`);
        dataStream.writeData({
          type: 'financial-tool-status',
          content: {
            tool: 'processFinancialData',
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
            type: 'financial-tool-status',
            content: { 
              tool: 'processFinancialData',
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
          id: id,
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

      // Add a new handler for fundamental data
      async function handleFundamentalDataFormat(id: string, apiResponse: any) {
        // Create processing metadata
        const processingMetadata: FinancialMetadata = {
          status: 'processing',
          tickers: apiResponse.tickers,
          sessionId: apiResponse.session_id,
          resultPath: apiResponse.result_path,
          presignedUrl: apiResponse.presigned_url,
          hasFundamentalData: true
        };
        
        // Save document record with processing metadata
        console.log(`💾 Saving initial document for fundamental data: id=${id}, tickers=${apiResponse.tickers.join(', ')}`);
        await saveDocument({
          chatId: id,
          id: id,
          title: `Fundamental Data: ${apiResponse.tickers.join(', ')}`,
          kind: 'financial',
          userId: session.user?.id || 'anonymous',
          content: JSON.stringify(processingMetadata),
        });
        
        // Update status with processing info
        dataStream.writeData({
          type: 'financial-tool-status',
          content: {
            tool: 'processFinancialData',
            status: 'processing',
            message: 'Fetching fundamental data...',
            tickers: apiResponse.tickers,
            sessionId: apiResponse.session_id,
            resultPath: apiResponse.result_path,
            presignedUrl: apiResponse.presigned_url,
            hasFundamentalData: true
          }
        });
        
        try {
          // Fetch and parse the fundamental data
          const fundamentalData = await handleFundamentalData(apiResponse.presigned_url);
          
          // Identify available metrics from the first data point
          const firstDataPoint = fundamentalData.data[0];
          const availableMetrics = Object.keys(firstDataPoint)
            .filter(key => !['ticker', 'report_period', 'fiscal_period'].includes(key));
          
          console.log(`📊 Fundamental data contains metrics: [${availableMetrics.join(', ')}]`);
          
          // Default to the first metric if multiple are available
          const defaultMetric = availableMetrics.length > 0 ? availableMetrics[0] : '';
          
          // Get unique tickers
          const uniqueTickers = Array.from(new Set(fundamentalData.data.map(item => item.ticker)));
          
          // Create final metadata with ready state
          const finalMetadata: FinancialMetadata = {
            status: 'ready',
            tickers: uniqueTickers,
            sessionId: apiResponse.session_id,
            resultPath: apiResponse.result_path,
            presignedUrl: apiResponse.presigned_url,
            hasFundamentalData: true,
            fundamentalData: fundamentalData,
            selectedFundamentalMetric: defaultMetric,
            visualizationReady: true
          };
          
          // Update document with final metadata
          await saveDocument({
            chatId: id,
            id: id,
            title: `Fundamental Data: ${uniqueTickers.join(', ')}`,
            kind: 'financial',
            userId: session.user?.id || 'anonymous',
            content: JSON.stringify(finalMetadata),
          });
          
          // Send the fundamental data to the client
          // Create a simplified version of the data that can be safely serialized
          const safeData = {
            tool: 'processFinancialData',
            status: 'ready',
            tickers: uniqueTickers,
            sessionId: apiResponse.session_id,
            resultPath: apiResponse.result_path,
            presignedUrl: apiResponse.presigned_url,
            hasFundamentalData: true,
            visualizationReady: true,
            selectedFundamentalMetric: defaultMetric,
            // Include just the necessary parts of fundamental data
            fundamentalData: {
              data: fundamentalData.data.map(row => ({...row})),
              metadata: {...fundamentalData.metadata}
            }
          };

          dataStream.writeData({
            type: 'financial-tool-status',
            content: safeData
          });
          
          // Send finish signal
          dataStream.writeData({ type: 'finish', content: '' });
          
          return {
            kind: 'financial',
            chatId: id,
            success: true,
            message: `Successfully processed fundamental data for tickers: ${uniqueTickers.join(', ')}`,
            data: {
              tickers: uniqueTickers,
              fundamentalData: fundamentalData,
              metrics: availableMetrics,
              metadata: finalMetadata
            }
          };
        } catch (error: any) {
          console.error(`❌ Error fetching/processing fundamental data:`, error);
          throw error;
        }
      }
    }
  });

/**
 * Handles fetching and parsing universe data from a presigned URL.
 * Returns a UniverseDataResponse object.
 */
export async function handleUniverseQuery(presignedUrl: string): Promise<UniverseDataResponse> {
  const response = await fetch(presignedUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch universe data: ${response.statusText}`);
  }
  const data: UniverseDataResponse = await response.json();
  // Optionally: validate structure here
  return data;
}

/**
 * Handles fetching and parsing fundamental financial data from a presigned URL.
 * Returns a FundamentalDataResponse object with the parsed data.
 */
export async function handleFundamentalData(presignedUrl: string): Promise<FundamentalDataResponse> {
  console.log(`📊 Fetching fundamental data from presigned URL`);
  
  const response = await fetch(presignedUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch fundamental data: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Validate the data structure
  if (!data.data || !Array.isArray(data.data) || !data.metadata) {
    throw new Error('Invalid fundamental data format');
  }
  
  // Ensure we have the expected fields in the data
  if (data.data.length > 0) {
    const firstRow = data.data[0];
    if (!firstRow.ticker || !firstRow.report_period || !firstRow.fiscal_period) {
      throw new Error('Missing required fields in fundamental data');
    }
  }
  
  return data as FundamentalDataResponse;
} 