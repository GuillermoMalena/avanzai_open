/**
 * Financial API client for fetching financial price data
 */
import { FinancialApiResponse, UniverseDataResponse } from '@/lib/models/financial-data';

interface FetchOptions {
  maxRetries?: number;
  timeoutMs?: number;
  retryDelayMs?: number;
}

/**
 * Makes a single request to the financial API
 */
async function makeRequest(
  query: string,
  timeRange: string,
  sessionId: string,
  signal: AbortSignal
): Promise<FinancialApiResponse> {
  // Get API URL from environment variables or use default
  const apiUrl = process.env.FINANCIAL_API_URL || 'http://localhost:8000';
  const endpoint = `${apiUrl}/process_query`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query,
      timeRange,
      session_id: sessionId
    }),
    signal
  });
  
  // Check for HTTP errors
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  
  // Parse response
  const result = await response.json();
  
  // Validate response structure
  if (result.status !== 'success') {
    throw new Error(result.error?.message || 'Unknown API error');
  }
  
  return result;
}

/**
 * Fetches financial data from the API with retry logic
 * @param query Search query or ticker symbol
 * @param timeRange Optional time range (e.g., '1d', '1w', '1m', '1y')
 * @param sessionId Session identifier (required by backend)
 * @param options Configuration for retries and timeouts
 * @returns Processed financial data response
 */
export async function fetchFinancialData(
  query: string,
  timeRange: string = '1y',
  sessionId?: string,
  options: FetchOptions = {}
): Promise<FinancialApiResponse> {
  const {
    maxRetries = 3,
    timeoutMs = 30000, // 30 seconds default
    retryDelayMs = 2000 // 2 seconds default
  } = options;
  
  console.log(`📡 Fetching financial data for: ${query}, timeRange: ${timeRange}`);
  
  let lastError: Error | null = null;
  const session_id = sessionId || 'default-session';
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Create a new AbortController for this attempt
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log(`⏱️ Request timeout on attempt ${attempt} after ${timeoutMs}ms`);
      }, timeoutMs);
      
      console.log(`🔄 API request attempt ${attempt} of ${maxRetries}`);
      const result = await makeRequest(query, timeRange, session_id, controller.signal);
      
      // Clear timeout if request succeeds
      clearTimeout(timeoutId);
      
      // Log success details
      if (result.tickers) {
        console.log(`✅ API response received: tickers: [${result.tickers.join(', ')}]`);
      } else if (result.query?.symbol) {
        console.log(`✅ API response received: symbol: ${result.query.symbol}`);
      }
      
      return result;
      
    } catch (error: any) {
      lastError = error;
      
      // Clear any existing timeout
      if (error.name === 'AbortError') {
        console.error(`⏱️ Request aborted (timeout) on attempt ${attempt}`);
      } else {
        console.error(`❌ Error on attempt ${attempt}:`, error.message);
      }
      
      // If we have more retries, wait and try again
      if (attempt < maxRetries) {
        const delay = retryDelayMs * attempt; // Exponential backoff
        console.log(`⏳ Waiting ${delay}ms before retry ${attempt + 1}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If we're out of retries, throw the final error
      break;
    }
  }
  
  // If we get here, all retries failed
  const finalError = new Error(
    `Failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`
  );
  console.error(`❌ All retry attempts failed:`, finalError.message);
  throw finalError;
}

/**
 * Fetches universe data from the backend FastAPI service.
 * 1. Calls the /process_universe_query endpoint with the given params.
 * 2. Expects a presigned_url in the response.
 * 3. Fetches the actual data from the presigned_url.
 * 4. Returns the parsed UniverseDataResponse.
 */
export async function fetchUniverseData(params: Record<string, any>): Promise<UniverseDataResponse> {
  // Step 1: Call the FastAPI endpoint
  const apiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
  const endpoint = `${apiUrl}/process_universe_query`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Universe query failed: ${response.statusText}`);
  }

  const apiResult = await response.json();

  // Step 2: Validate presence of presigned_url
  const presignedUrl = apiResult.presigned_url;
  if (!presignedUrl) {
    throw new Error('No presigned_url returned from universe query');
  }

  // Step 3: Fetch the actual data from the presigned_url
  const dataResponse = await fetch(presignedUrl);
  if (!dataResponse.ok) {
    throw new Error(`Failed to fetch universe data: ${dataResponse.statusText}`);
  }

  // Step 4: Parse and return the data
  const universeData: UniverseDataResponse = await dataResponse.json();
  return universeData;
} 