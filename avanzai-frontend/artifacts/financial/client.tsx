/**
 * Client-side component for financial artifacts
 */
import { Artifact } from "@/components/create-artifact";
import { FinancialMetadata, ProcessedTimeSeriesData } from "@/lib/models/financial-data";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useMemo } from 'react';

// Colors for different tickers
const CHART_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6'  // purple
];

interface TimeSeriesDataPoint {
  date: string;
  [ticker: string]: number | string;
}

/**
 * Financial chart component that renders based on metadata state
 */
const FinancialChart = ({ metadata }: { metadata: FinancialMetadata }) => {
  // Handle missing metadata case first
  if (!metadata) {
    return (
      <div className="flex items-center justify-center h-64 bg-background rounded-lg">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
          <p className="mt-4 text-muted-foreground">Loading financial data...</p>
        </div>
      </div>
    );
  }
  
  // Handle errors
  if (metadata.error) {
    const errorMessage = metadata.error;
    const isTimeout = metadata.isTimeout;
    const details = metadata.details;

    return (
      <div className="flex items-center justify-center h-64 bg-destructive/10 rounded-lg">
        <div className="text-center p-6">
          <div className="inline-block rounded-full h-12 w-12 bg-destructive/20 text-destructive flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-destructive">
            {isTimeout ? 'Request Timeout' : 'Error Loading Data'}
          </h3>
          <p className="mt-2 text-sm text-destructive/80">{errorMessage}</p>
          {details && (
            <p className="mt-2 text-sm text-destructive/70">{details}</p>
          )}
          {isTimeout && (
            <div className="mt-4">
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Memoize chart data preparation
  const { combinedChartData, minDate, maxDate, tickers, hasData } = useMemo(() => {
    const emptyResult = {
      combinedChartData: [] as TimeSeriesDataPoint[],
      minDate: '',
      maxDate: '',
      tickers: [] as string[],
      hasData: false
    };

    console.log('Financial Chart Data:', {
      hasMetadata: !!metadata,
      hasTickerData: !!metadata?.tickerData,
      tickers: metadata?.tickers,
      status: metadata?.status
    });

    // Check if we have ticker data
    if (!metadata?.tickerData || !metadata?.tickers || metadata.tickers.length === 0) {
      console.log('No ticker data available');
      return emptyResult;
    }

    const tickers = metadata.tickers;
    
    // Convert tickerData to combined format
    const dateMap = new Map<string, TimeSeriesDataPoint>();
    
    // Process each ticker's data
    tickers.forEach(ticker => {
      const tickerData = metadata.tickerData![ticker] || [];
      tickerData.forEach(point => {
        const date = point.timestamp;
        if (!dateMap.has(date)) {
          dateMap.set(date, { date });
        }
        dateMap.get(date)![ticker] = point.value;
      });
    });

    // Convert map to array and sort by date
    const combinedChartData = Array.from(dateMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (combinedChartData.length === 0) {
      console.log('No data points after combining');
      return emptyResult;
    }

    // Find min and max dates
    const allDates = combinedChartData.map(point => new Date(point.date).getTime());
    const minDate = new Date(Math.min(...allDates)).toISOString();
    const maxDate = new Date(Math.max(...allDates)).toISOString();

    console.log('Processed chart data:', {
      dataPoints: combinedChartData.length,
      tickers,
      minDate,
      maxDate,
      samplePoint: combinedChartData[0]
    });

    return {
      combinedChartData,
      minDate,
      maxDate,
      tickers,
      hasData: true
    };
  }, [metadata]);

  // No data available
  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64 bg-warning/10 rounded-lg">
        <div className="text-center p-6">
          <div className="inline-block rounded-full h-12 w-12 bg-warning/20 text-warning flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-warning-foreground">No data available</h3>
          <p className="mt-2 text-sm text-warning/80">No financial data is available for visualization.</p>
        </div>
      </div>
    );
  }
  
  // Format date helper function
    const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric',
        month: 'short', 
        day: 'numeric' 
      });
    };
    
  // We have data, render the chart
    return (
      <div className="financial-chart-container p-4 bg-background rounded-lg shadow">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {tickers.join(', ')} Price History
          </h3>
          <p className="text-sm text-muted-foreground">
            {combinedChartData.length} data points | 
            <span className="ml-1">
              {formatDateDisplay(minDate)} to {formatDateDisplay(maxDate)}
            </span>
          </p>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={combinedChartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="rgba(255, 255, 255, 0.65)"
              tick={{ fill: 'rgba(255, 255, 255, 0.65)' }}
              tickFormatter={(date) => {
                return new Date(date).toLocaleDateString(undefined, { 
                  month: 'short',
                  day: 'numeric'
                });
              }}
            />
            <YAxis 
              stroke="rgba(255, 255, 255, 0.65)"
              tick={{ fill: 'rgba(255, 255, 255, 0.65)' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: 'rgba(255, 255, 255, 0.9)'
              }}
              labelStyle={{
                color: 'rgba(255, 255, 255, 0.7)'
              }}
              itemStyle={{
                color: 'rgba(255, 255, 255, 0.9)'
              }}
              labelFormatter={(date) => {
                return new Date(date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric' 
                });
              }}
            />
            <Legend 
              wrapperStyle={{
                color: 'rgba(255, 255, 255, 0.9)'
              }}
            />
            {tickers.map((ticker, index) => (
              <Line 
                key={ticker}
                type="monotone" 
                dataKey={ticker} 
                stroke={CHART_COLORS[index % CHART_COLORS.length]} 
                dot={false}
                name={ticker}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
    </div>
  );
};

/**
 * Financial artifact implementation
 */
export const financialArtifact = new Artifact<'financial', FinancialMetadata>({
  kind: 'financial',
  description: 'Financial data visualization',
  content: FinancialChart,
  
  // Initialize method to set up default metadata
  initialize: ({ documentId, setMetadata }) => {
    console.log(`🔧 Initializing financial artifact: ${documentId}`);
    
    // Set initial loading state
    setMetadata({
        status: 'loading',
        tickers: [],
      tickerData: {}
    });
  },
  
  // Required handler for stream parts, but we don't use it
  onStreamPart: () => {},
  
  toolbar: [],
  actions: []
}); 