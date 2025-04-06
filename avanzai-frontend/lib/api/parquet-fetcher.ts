/**
 * Utility for fetching and parsing Parquet data from presigned URLs
 */
import { ParquetDataResponse, ProcessedTimeSeriesData } from '@/lib/models/financial-data';

/**
 * Fetches parquet data from a presigned URL
 * @param presignedUrl Direct URL to download the parquet file
 * @returns Processed data response
 */
export async function fetchParquetData(presignedUrl: string): Promise<ParquetDataResponse> {
  console.log(`📡 Fetching data from presigned URL`);
  
  try {
    // Fetch the data directly from the presigned URL
    const response = await fetch(presignedUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }
    
    // Parse the JSON response
    const jsonData = await response.json();
    
    // Extract the data array from the response
    const dataArray = jsonData.data;
    
    if (!Array.isArray(dataArray)) {
      throw new Error('Invalid data format: expected data array');
    }
    
    console.log(`✅ Successfully fetched data with ${dataArray.length} rows`);
    
    // Get the ticker columns from the first record (excluding 'date')
    const firstRecord = dataArray[0] || {};
    const columns = Object.keys(firstRecord).filter(key => key !== 'date');
    
    return {
      data: dataArray,
      columns: ['date', ...columns]
    };
  } catch (error: any) {
    console.error(`❌ Error fetching data:`, error);
    throw new Error(`Error fetching/processing data: ${error.message}`);
  }
}

/**
 * Transform parquet data to time series format for charting
 */
export function parseParquetToTimeSeriesData(
  parquetData: ParquetDataResponse,
  tickers: string[]
): Record<string, ProcessedTimeSeriesData[]> {
  const result: Record<string, ProcessedTimeSeriesData[]> = {};
  
  // Initialize arrays for each ticker
  tickers.forEach(ticker => {
    result[ticker] = [];
  });
  
  // Transform data for each ticker
  parquetData.data.forEach((item: { date: string; [key: string]: string | number }) => {
    if (!item.date) return;
    
    tickers.forEach(ticker => {
      if (ticker in item) {
        const value = parseFloat(String(item[ticker]));
        if (!isNaN(value)) {
          result[ticker].push({
            timestamp: item.date,
            value
          });
        }
      }
    });
  });
  
  // Sort each ticker's data by timestamp
  Object.keys(result).forEach(ticker => {
    result[ticker].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  });
  
  return result;
}

/**
 * Legacy adapter to convert multi-ticker data to the old format
 * for backward compatibility
 */
export function convertToLegacyFormat(
  tickerData: Record<string, ProcessedTimeSeriesData[]>,
  primaryTicker?: string
): ProcessedTimeSeriesData[] {
  // If there's a primary ticker specified, use that; otherwise use the first one
  const ticker = primaryTicker || Object.keys(tickerData)[0];
  
  // If we have data for this ticker, return it; otherwise return empty array
  return ticker && tickerData[ticker] ? tickerData[ticker] : [];
} 