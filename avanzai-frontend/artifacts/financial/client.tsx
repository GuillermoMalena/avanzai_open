/**
 * Client-side component for financial artifacts
 */
import { Artifact, InitializeParameters } from "@/components/create-artifact";
import { FinancialMetadata, ProcessedTimeSeriesData, UniverseDataResponse, UniverseDataRow, UniverseDataMetadata } from "@/lib/models/financial-data";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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

interface ChartDataPoint {
  date: string;
  [ticker: string]: number | string;  // Allow string for date and numbers for values
}

interface EnhancedFinancialMetadata extends FinancialMetadata {
  processedChartData?: ChartDataPoint[];
}

/**
 * Universe bar chart component that renders ranked ticker data
 */
const UniverseBarChart = ({ data, metadata }: { data: UniverseDataRow[], metadata: UniverseDataMetadata }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-warning/10 rounded-lg">
        <div className="text-center p-6">
          <div className="inline-block rounded-full h-12 w-12 bg-warning/20 text-warning flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-warning-foreground">No universe data available</h3>
          <p className="mt-2 text-sm text-warning/80">No universe ranking data is available for visualization.</p>
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

  // Determine which field to use and prepare the data
  const dataField = metadata.metric === 'correlation' ? 'correlation' : 'total_return';
  const displayName = metadata.metric === 'correlation' ? 'Correlation' : 'Total Return';
  const formatValue = (value: number) => {
    if (metadata.metric === 'correlation') {
      return value.toFixed(3);
    }
    return `${(value * 100).toFixed(2)}%`;
  };

  // Prepare the data for the bar chart - ensure it's sorted by rank
  const sortedData = [...data].sort((a, b) => (a.rank || 0) - (b.rank || 0));
  
  return (
    <div className="universe-chart-container p-4 bg-background rounded-lg shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {metadata.metric} Ranking
        </h3>
        <p className="text-sm text-muted-foreground">
          Top {data.length} tickers | 
          <span className="ml-1">
            {formatDateDisplay(metadata.start_date)} to {formatDateDisplay(metadata.end_date)}
          </span>
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={sortedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            type="number"
            stroke="rgba(255, 255, 255, 0.65)"
            tick={{ fill: 'rgba(255, 255, 255, 0.65)' }}
          />
          <YAxis 
            type="category"
            dataKey="ticker"
            stroke="rgba(255, 255, 255, 0.65)"
            tick={{ fill: 'rgba(255, 255, 255, 0.65)' }}
            width={80}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              color: 'rgba(255, 255, 255, 0.9)'
            }}
            formatter={(value) => [formatValue(Number(value)), displayName]}
          />
          <Legend />
          <Bar 
            dataKey={dataField}
            name={displayName}
            fill={CHART_COLORS[0]}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Financial chart component that renders based on metadata state
 */
const FinancialChart = ({ metadata }: { metadata: FinancialMetadata }) => {
  // Handle missing metadata case first
  if (!metadata) {
    console.log('[DEBUG-BROWSER] Missing metadata in FinancialChart');
    return (
      <div className="flex items-center justify-center h-64 bg-background rounded-lg">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
          <p className="mt-4 text-muted-foreground">Loading financial data...</p>
        </div>
      </div>
    );
  }

  // Add detailed debug logging for metadata
  console.log('[DEBUG-BROWSER] FinancialChart metadata:', {
    hasUniverseData: !!metadata.universeData,
    universeDataLength: metadata.universeData?.data?.length,
    universeMetadata: metadata.universeData?.metadata,
    hasTickerData: !!metadata.tickerData,
    tickerCount: metadata.tickers?.length,
    status: metadata.status,
    visualizationReady: metadata.visualizationReady
  });

  // First determine what type of data we have
  const hasValidUniverseData = metadata.universeData && 
    Array.isArray(metadata.universeData.data) && 
    metadata.universeData.data.length > 0 &&
    metadata.universeData.metadata;

  const hasValidTimeSeriesData = metadata.tickerData && 
    metadata.tickers && 
    metadata.tickers.length > 0;

  // For universe data, render the bar chart
  if (hasValidUniverseData && metadata.universeData) {
    console.log('[DEBUG-BROWSER] Rendering universe bar chart', {
      dataLength: metadata.universeData.data.length,
      metadata: metadata.universeData.metadata
    });
    return (
      <UniverseBarChart 
        data={metadata.universeData.data} 
        metadata={metadata.universeData.metadata} 
      />
    );
  }

  // For instrument data, continue with the existing line chart logic
  // Memoize chart data preparation
  const { combinedChartData, minDate, maxDate, tickers, hasData } = useMemo(() => {
    const emptyResult = {
      combinedChartData: [],
      minDate: '',
      maxDate: '',
      tickers: [] as string[],
      hasData: false
    };

    // If we don't have time series data, return empty result
    if (!hasValidTimeSeriesData) {
      console.log('[DEBUG-BROWSER] No time series data available');
      return emptyResult;
    }

    // If we have pre-processed data, use it directly
    const enhancedMetadata = metadata as EnhancedFinancialMetadata;
    if (enhancedMetadata?.processedChartData && enhancedMetadata.processedChartData.length > 0) {
      console.log('[DEBUG-BROWSER] Using pre-processed chart data');
      
      // Already have processed data, just need to calculate min/max dates
      const allDates = enhancedMetadata.processedChartData.map(point => new Date(point.date).getTime());
      return {
        combinedChartData: enhancedMetadata.processedChartData,
        minDate: new Date(Math.min(...allDates)).toISOString(),
        maxDate: new Date(Math.max(...allDates)).toISOString(),
        tickers: metadata.tickers || [],
        hasData: true
      };
    }

    // Process time series data
    const tickers = metadata.tickers!;
    const dateMap = new Map<string, ChartDataPoint>();
    
    // Process each ticker's data
    tickers.forEach(ticker => {
      const tickerData = metadata.tickerData![ticker] || [];
      tickerData.forEach(point => {
        if (!dateMap.has(point.timestamp)) {
          dateMap.set(point.timestamp, { date: point.timestamp });
        }
        const entry = dateMap.get(point.timestamp);
        if (entry) {
          entry[ticker] = point.value;
        }
      });
    });

    // Convert map to array and sort by date
    const combinedChartData = Array.from(dateMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (combinedChartData.length === 0) {
      console.log('[DEBUG-BROWSER] No data points after combining time series data');
      return emptyResult;
    }

    // Find min and max dates
    const allDates = combinedChartData.map(point => new Date(point.date).getTime());
    const minDate = new Date(Math.min(...allDates)).toISOString();
    const maxDate = new Date(Math.max(...allDates)).toISOString();

    return {
      combinedChartData,
      minDate,
      maxDate,
      tickers,
      hasData: true
    };
  }, [metadata, hasValidTimeSeriesData]);

  // No data available
  if (!hasData && !hasValidUniverseData) {
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
  initialize: async ({ documentId, setMetadata }: InitializeParameters<FinancialMetadata>) => {
    const response = await fetch(`/api/documents/${documentId}`);
    if (!response.ok) {
        setMetadata({
            status: 'loading',
            tickers: [],
            tickerData: {}
        });
        return;
    }
    
    const document = await response.json();
    if (document.content || document.metadata) {
        // First try to parse the content, as it contains the most up-to-date data
        try {
            const contentMetadata = document.content ? JSON.parse(document.content) : null;
            if (contentMetadata) {
                setMetadata(contentMetadata);
                return;
            }
        } catch (e) {
            console.error('[DEBUG-BROWSER] Error parsing document content:', e);
        }
        
        // Fall back to metadata if content parsing fails
        const metadata = typeof document.metadata === 'string' ? 
            JSON.parse(document.metadata) : 
            document.metadata;
            
        setMetadata(metadata);
    } else {
        setMetadata({
            status: 'loading',
            tickers: [],
            tickerData: {}
        });
    }
  },
  
  // Handle stream parts for financial data
  onStreamPart: ({ streamPart, setMetadata }) => {
    console.log('[DEBUG-BROWSER] Financial onStreamPart:', streamPart);

    if (streamPart.type === 'financial_ticker_data') {
      const { ticker, data } = streamPart.content;
      setMetadata((currentMetadata) => ({
        ...currentMetadata,
        tickerData: {
          ...currentMetadata.tickerData,
          [ticker]: data
        },
        tickers: currentMetadata.tickers?.includes(ticker) 
          ? currentMetadata.tickers 
          : [...(currentMetadata.tickers || []), ticker]
      }));
    }
    else if (streamPart.type === 'financial-tool-status') {
      const status = streamPart.content;
      
      // For universe data, we need to handle both the status and the complete data
      setMetadata((currentMetadata) => {
        const newMetadata = {
          ...currentMetadata,
          status: status.status,
          visualizationReady: status.visualizationReady ?? currentMetadata.visualizationReady,
          error: status.error,
          details: status.details,
          isTimeout: status.isTimeout
        };

        // If this is a universe data response, it will have the complete data structure
        if (status.tool === 'processUniverseData' && status.status === 'ready') {
          return {
            ...newMetadata,
            universeData: {
              data: status.universeData?.data || [],
              metadata: status.universeData?.metadata || {}
            }
          };
        }

        return newMetadata;
      });
    }
  },
  
  toolbar: [],
  actions: []
}); 