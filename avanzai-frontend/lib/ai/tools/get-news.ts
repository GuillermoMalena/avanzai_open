/**
 * AI Tool for fetching news using web search functionality
 */
import { DataStreamWriter, Tool, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { Session } from 'next-auth';
import { generateText } from 'ai';

interface GetNewsProps {
  session: Session;
  dataStream: DataStreamWriter;
  chatId: string;
}

/**
 * Helper function to build a search query from the parameters
 */
function buildSearchQuery(query: string, timeframe?: string, location?: string): string {
  let searchQuery = query;
  
  if (timeframe) {
    searchQuery += ` from ${timeframe}`;
  }
  
  if (location) {
    searchQuery += ` in ${location}`;
  }
  
  return searchQuery;
}

/**
 * Tool for getting news from the web using web search
 */
export const getNews = ({ session, dataStream, chatId }: GetNewsProps) =>
  tool({
    description: 'Fetch recent news about a topic using web search',
    parameters: z.object({
      query: z.string().describe('News search query (e.g., "Tech news", "San Francisco events", "World politics latest")'),
      timeframe: z.string().describe('Timeframe for news (e.g., "today", "this week", "last month")'),
      location: z.string().describe('Geographic focus of news (e.g., "US", "Europe", "global")')
    }),
    experimental_toToolResultContent: (result: any) => {
      console.log(`[NEWS-TRANSFORM] Converting tool result to content for AI model`);
      console.log(`[NEWS-TRANSFORM] Original result type: ${typeof result}`);
      
      if (result && typeof result === 'object') {
        console.log(`[NEWS-TRANSFORM] Original result keys: ${Object.keys(result).join(', ')}`);
      }
      
      if (result && typeof result === 'object' && 'error' in result) {
        const errorMsg = `Error fetching news: ${result.error}`;
        console.log(`[NEWS-TRANSFORM] Returning error message: ${errorMsg}`);
        return [{ type: 'text', text: errorMsg }];
      }
      
      if (result && typeof result === 'object' && 'content' in result) {
        let formattedContent = result.content || '';
        
        let sourcesSection = '';
        if ('sources' in result && Array.isArray(result.sources) && result.sources.length > 0) {
          sourcesSection = '\n\nSources:\n' + result.sources.map((source: any) => 
            `- ${source.title || source.url}: ${source.url}`
          ).join('\n');
        }
        
        const finalContent = formattedContent + sourcesSection;
        console.log(`[NEWS-TRANSFORM] Formatted content length: ${finalContent.length}`);
        console.log(`[NEWS-TRANSFORM] Formatted content preview: ${finalContent.substring(0, 100)}...`);
        
        return [{ type: 'text', text: finalContent }];
      }
      
      console.log(`[NEWS-TRANSFORM] Unexpected result format, returning generic message`);
      return [{ type: 'text', text: "News search completed, but results are in an unexpected format." }];
    },
    execute: async ({ query, timeframe, location }) => {
      const searchQuery = buildSearchQuery(query, timeframe, location);
      
      console.log(`[TOOL-NEWS-DEBUG] Starting news search for: "${searchQuery}"`);
      console.log(`[TOOL-NEWS-DEBUG] DataStream available: ${!!dataStream}`);
      
      try {
        console.log(`[TOOL-NEWS-DEBUG] Adding stream marker BEFORE API call`);
        dataStream.writeData({
          type: 'tool-loading',
          content: { 
            tool: 'getNews',
            isLoading: true,
            message: `Searching for news about: ${searchQuery}`
          }
        });
        
        const result = await generateText({
          model: openai.responses('gpt-4o-mini'),
          prompt: searchQuery,
          tools: {
            web_search_preview: openai.tools.webSearchPreview({
              searchContextSize: 'high',
              userLocation: location ? {
                type: 'approximate',
                city: location,
                region: 'global'
              } : undefined
            }),
          },
          toolChoice: { type: 'tool', toolName: 'web_search_preview' }
        });
        
        const content = result.text;
        const sources = result.sources || [];
        
        console.log(`[TOOL-NEWS-DEBUG] Adding stream marker AFTER API call`);
        dataStream.writeData({
          type: 'tool-loading',
          content: { 
            tool: 'getNews',
            isLoading: false,
            message: null
          }
        });
        
        console.log(`[TOOL-NEWS-DEBUG] Adding finish marker to stream`);
        dataStream.writeData({ 
          type: 'finish', 
          content: '' 
        });
        
        console.log(`[TOOL-NEWS-DEBUG] Got raw result: ${JSON.stringify({
          contentLength: content.length,
          sourcesCount: sources.length
        })}`);
        
        const resultToReturn = {
          success: true,
          content,
          sources
        };
        console.log(`[TOOL-NEWS-DEBUG] Returning result object to AI. Keys: ${Object.keys(resultToReturn).join(', ')}`);
        return resultToReturn;
        
      } catch (error: any) {
        console.error(`❌ Error fetching news: ${error.message}`);
        
        dataStream.writeData({
          type: 'tool-loading',
          content: {
            tool: 'getNews',
            isLoading: false,
            message: `Error: ${error.message || 'Failed to fetch news'}`
          }
        });
        
        return {
          error: error.message || 'Failed to fetch news'
        };
      }
    }
  });