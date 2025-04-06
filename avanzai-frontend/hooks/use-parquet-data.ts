import { useState, useEffect } from 'react';
import { fetchParquetData, parseParquetToTimeSeriesData } from '@/lib/api/parquet-fetcher';
import { ProcessedTimeSeriesData } from '@/lib/models/financial-data';

export interface UseParquetDataResult {
  isLoading: boolean;
  error: string | null;
  data: Record<string, ProcessedTimeSeriesData[]> | null;
}

/**
 * Custom hook for fetching parquet data from a presigned URL
 */
export function useParquetData(
  presignedUrl: string | null,
  tickers: string[],
): UseParquetDataResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, ProcessedTimeSeriesData[]> | null>(null);
  
  useEffect(() => {
    async function fetchData() {
      if (!presignedUrl || !tickers.length) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const parquetData = await fetchParquetData(presignedUrl);
        const timeSeriesData = parseParquetToTimeSeriesData(parquetData, tickers);
        
        setData(timeSeriesData);
      } catch (err: any) {
        console.error('Error fetching parquet data:', err);
        setError(err.message || 'Failed to fetch parquet data');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [presignedUrl, tickers]);
  
  return { isLoading, error, data };
} 