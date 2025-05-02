/**
 * Type definitions for financial data
 */

/**
 * Response from the financial API
 */
export interface FinancialApiResponse {
  status: string;
  query?: {
    symbol: string;
    metrics: string[];
  };
  tickers?: string[];  // New field for multi-ticker support
  data?: Array<{
    date: string;
    [symbol: string]: number | string;
  }>;
  metadata?: {
    dataSource: string;
    dataId: string;
    sessionId: string;
  };
  session_id?: string;  // New field from updated API
  timestamp?: string;   // New field from updated API
  result_path?: string; // New field from updated API
  presigned_url?: string; // New field for direct file access
  start_date?: string;    // New field: start date of the analysis period
  end_date?: string;      // New field: end date of the analysis period
  cumulative_returns?: {  // New field: cumulative returns for each ticker
    [ticker: string]: number;
  };
  error?: {
    code: string;
    message: string;
    details?: string;  // Add details field for additional error information
  };
}

/**
 * Processed time series data points for charting
 */
export interface ProcessedTimeSeriesData {
  timestamp: string;
  value: number;
}

/**
 * Parquet data response format
 */
export interface ParquetDataResponse {
  data: Array<{
    date: string;
    [ticker: string]: number | string;
  }>;
  columns: string[];
}

/**
 * Fundamental data response format for quarterly financial data
 */
export interface FundamentalDataResponse {
  data: FundamentalDataRow[];
  metadata: FundamentalDataMetadata;
}

/**
 * Individual fundamental data row with dynamic metrics
 */
export interface FundamentalDataRow {
  ticker: string;
  report_period: string;
  fiscal_period: string;
  [metric: string]: string | number; // Dynamic field for any fundamental metric
}

/**
 * Metadata for fundamental data responses
 */
export interface FundamentalDataMetadata {
  generated_at: string;
  row_count: number;
  columns: string[]; // This includes all available metrics
  start_date: string;
  end_date: string;
  session_id: string;
}

/**
 * Financial artifact metadata state
 */
export interface FinancialMetadata {
  status: 'initial' | 'loading' | 'processing' | 'fetching_parquet' | 'ready' | 'error';
  symbol?: string;
  tickers?: string[];     // Updated for multi-ticker support
  metrics?: string[];
  dataId?: string;
  sessionId?: string;
  resultPath?: string;    // New field for parquet path
  presignedUrl?: string;  // New field for direct access
  timeSeriesData?: ProcessedTimeSeriesData[];
  dataPoints?: number;
  loadedPoints?: number;
  error?: string;
  isTimeout?: boolean;    // New field to indicate timeout errors
  details?: string;       // New field for detailed error information
  visualizationReady?: boolean;
  tickerData?: Record<string, ProcessedTimeSeriesData[]>; // For storing data by ticker
  data?: Array<{          // New field for JSON format
    date: string;
    [ticker: string]: number | string;
  }>;
  universeData?: UniverseDataResponse; // New field for universe query results
  fundamentalData?: FundamentalDataResponse; // New field for fundamental financial data
  hasFundamentalData?: boolean; // Flag to indicate fundamental data is available
  selectedFundamentalMetric?: string; // Currently selected metric to visualize
}

/**
 * Validates time series data
 */
export function validateTimeSeriesData(data: ProcessedTimeSeriesData[]): boolean {
  console.log(`🔍 Validating ${data.length} time series data points`);
  
  if (!Array.isArray(data) || data.length === 0) {
    console.error("❌ Data validation failed: Empty or not an array");
    return false;
  }
  
  const allValid = data.every(point => 
    typeof point.timestamp === 'string' && 
    !isNaN(point.value)
  );
  
  console.log(`✅ Data validation ${allValid ? "passed" : "failed"}`);
  return allValid;
}

// Universe query data types
export interface UniverseDataRow {
  ticker: string;
  total_return: number;
  rank: number;
}

export interface UniverseDataMetadata {
  metric: string;
  sort: string;
  length: number;
  start_date: string;
  end_date: string;
  generated_at: string;
  row_count: number;
  session_id: string;
}

export interface UniverseDataResponse {
  data: UniverseDataRow[];
  metadata: UniverseDataMetadata;
} 