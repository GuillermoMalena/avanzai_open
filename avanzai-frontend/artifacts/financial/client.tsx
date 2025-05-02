/**
 * Client-side component for financial artifacts
 */
import { Artifact, InitializeParameters } from "@/components/create-artifact";
import { FinancialMetadata, ProcessedTimeSeriesData, UniverseDataResponse, UniverseDataRow, UniverseDataMetadata, FundamentalDataRow, FundamentalDataMetadata } from "@/lib/models/financial-data";
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
              padding: '8px'
            }}
            formatter={(value, name) => {
              // Format value based on ticker
              if (typeof value === 'number') {
                // For percentage values (likely the CPIAUCSL)
                if (typeof name === 'string' && name.includes('CPIAUCSL') || Math.abs(value) < 50) {
                  return [`${value.toFixed(2)}%`, name];
                } 
                // For price values (likely AAPL)
                else {
                  return [`$${value.toFixed(2)}`, name];
                }
              }
              return [value, name];
            }}
            labelFormatter={(date) => {
              if (typeof date === 'string') {
                return new Date(date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric'
                });
              }
              return date;
            }}
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

  // Add detailed debug logging for metadata structure
  console.log('[DEBUG-BROWSER] FinancialChart metadata:', {
    hasUniverseData: !!metadata.universeData,
    universeDataLength: metadata.universeData?.data?.length,
    universeMetadata: metadata.universeData?.metadata,
    hasTickerData: !!metadata.tickerData,
    tickerCount: metadata.tickers?.length,
    hasNestedData: !!metadata.data,
    nestedDataLength: metadata.data?.length,
    nestedDataSample: metadata.data?.[0] ? Object.keys(metadata.data[0]) : [],
    hasFundamentalData: !!metadata.fundamentalData,
    fundamentalDataLength: metadata.fundamentalData?.data?.length,
    fundamentalMetric: metadata.selectedFundamentalMetric,
    status: metadata.status,
    visualizationReady: metadata.visualizationReady
  });

  // First determine what type of data we have
  const hasValidUniverseData = metadata.universeData && 
    Array.isArray(metadata.universeData.data) && 
    metadata.universeData.data.length > 0 &&
    metadata.universeData.metadata;

  const hasValidFundamentalData = metadata.fundamentalData && 
    Array.isArray(metadata.fundamentalData.data) && 
    metadata.fundamentalData.data.length > 0 && 
    metadata.fundamentalData.metadata && 
    metadata.selectedFundamentalMetric;

  const hasValidTimeSeriesData = (metadata.tickerData && 
    metadata.tickers && 
    metadata.tickers.length > 0) || 
    (metadata.data && 
    Array.isArray(metadata.data) && 
    metadata.data.length > 0);

  // For fundamental data, render the fundamental bar chart
  if (hasValidFundamentalData && metadata.fundamentalData && metadata.selectedFundamentalMetric) {
    console.log('[DEBUG-BROWSER] Rendering fundamental bar chart', {
      dataLength: metadata.fundamentalData.data.length,
      metadata: metadata.fundamentalData.metadata,
      metric: metadata.selectedFundamentalMetric
    });
    return (
      <FundamentalBarChart 
        data={metadata.fundamentalData.data} 
        metadata={metadata.fundamentalData.metadata}
        metric={metadata.selectedFundamentalMetric}
      />
    );
  }

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

    // Check for pure nested data format (data property with array)
    if (metadata.data) {
      console.log('[DEBUG-BROWSER] Found data property:', {
        isArray: Array.isArray(metadata.data),
        length: Array.isArray(metadata.data) ? metadata.data.length : 'not an array',
        firstItem: Array.isArray(metadata.data) && metadata.data.length > 0 ? metadata.data[0] : 'no items',
      });
      
      // Handle nested format: {'data': [{...}, {...}]}
      if (Array.isArray(metadata.data) && metadata.data.length > 0) {
        console.log('[DEBUG-BROWSER] Using nested data array format with', metadata.data.length, 'points');
        
        // Extract ticker names from the first data point (excluding 'date')
        const tickers = metadata.data[0] ? 
          Object.keys(metadata.data[0]).filter(key => key !== 'date') : 
          [];
        
        console.log('[DEBUG-BROWSER] Extracted tickers:', tickers);
        
        // Calculate min and max dates
        const allDates = metadata.data.map(point => new Date(point.date).getTime());
        const minDate = new Date(Math.min(...allDates)).toISOString();
        const maxDate = new Date(Math.max(...allDates)).toISOString();
        
        // Data is already in the correct format, just ensure numeric values
        const processedData = metadata.data.map(point => {
          // Create a new object with the date
          const newPoint: ChartDataPoint = { date: point.date };
          
          // Copy ticker values, ensuring they're numbers
          tickers.forEach(ticker => {
            if (point[ticker] !== undefined) {
              newPoint[ticker] = typeof point[ticker] === 'number' 
                ? point[ticker] 
                : parseFloat(String(point[ticker]));
            }
          });
          
          return newPoint;
        });
        
        console.log('[DEBUG-BROWSER] Processed data sample:', processedData.slice(0, 3));
        
        return {
          combinedChartData: processedData,
          minDate,
          maxDate,
          tickers,
          hasData: true
        };
      }
    }

    // Check if tickers is valid
    if (!metadata.tickers || !Array.isArray(metadata.tickers) || metadata.tickers.length === 0) {
      console.log('[DEBUG-BROWSER] No valid tickers available');
      return emptyResult;
    }

    // Check if tickerData is valid
    if (!metadata.tickerData || Object.keys(metadata.tickerData).length === 0) {
      console.log('[DEBUG-BROWSER] No valid ticker data available');
      return emptyResult;
    }

    // Debug the input data
    console.log('[DEBUG-BROWSER] Processing chart data:', {
      tickers: metadata.tickers,
      tickerDataKeys: Object.keys(metadata.tickerData),
      firstTickerDataPoints: metadata.tickers[0] ? metadata.tickerData[metadata.tickers[0]]?.length : 0
    });

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

    try {
      // Process time series data
      const tickers = metadata.tickers!;
      const dateMap = new Map<string, ChartDataPoint>();
      
      // Process each ticker's data
      tickers.forEach(ticker => {
        const tickerData = metadata.tickerData![ticker] || [];
        console.log(`[DEBUG-BROWSER] Processing ticker ${ticker} with ${tickerData.length} data points`);
        
        tickerData.forEach(point => {
          // Validate point structure
          if (!point || typeof point !== 'object' || !point.timestamp || point.value === undefined) {
            console.log(`[DEBUG-BROWSER] Invalid data point for ${ticker}:`, point);
            return; // Skip invalid points
          }
          
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

      console.log(`[DEBUG-BROWSER] Successfully processed ${combinedChartData.length} data points`);

      // Find min and max dates
      const allDates = combinedChartData.map(point => new Date(point.date).getTime());
      const minDate = new Date(Math.min(...allDates)).toISOString();
      const maxDate = new Date(Math.max(...allDates)).toISOString();

      return {
        combinedChartData,
        minDate,
        maxDate,
        tickers,
        hasData: combinedChartData.length > 0
      };
    } catch (error) {
      console.error('[DEBUG-BROWSER] Error processing chart data:', error);
      return emptyResult;
    }
  }, [metadata, hasValidTimeSeriesData]);

  // Determine if we should use dual Y-axes for the chart
  const useDualAxes = useMemo(() => {
    try {
      console.log('[DEBUG-BROWSER] Starting dual Y-axis calculation for tickers:', tickers);
      
      if (!tickers || tickers.length !== 2) {
        console.log('[DEBUG-BROWSER] Not using dual axes: Need exactly 2 tickers, got', tickers?.length);
        return false; // Only apply to two-ticker comparisons
      }
      
      if (!combinedChartData || combinedChartData.length === 0) {
        console.log('[DEBUG-BROWSER] Not using dual axes: No chart data available');
        return false;
      }
      
      // Calculate averages for each ticker
      const averages = tickers.map(ticker => {
        const values = combinedChartData
          .map(point => Number(point[ticker]))
          .filter(value => !isNaN(value));
        
        if (values.length === 0) {
          console.log(`[DEBUG-BROWSER] No valid values for ticker ${ticker}`);
          return 0;
        }
        
        return values.reduce((sum, val) => sum + val, 0) / values.length;
      });
      
      // If either average is zero or very small, don't attempt calculation
      if (averages[0] <= 0.01 || averages[1] <= 0.01) {
        console.log('[DEBUG-BROWSER] Not using dual axes: One or both averages too small:', averages);
        return false;
      }
      
      // Calculate ratio between averages
      const ratio = Math.max(...averages) / Math.min(...averages);
      
      console.log('[DEBUG-BROWSER] Dual Y-axis calculation:', {
        ticker1: tickers[0],
        ticker2: tickers[1],
        average1: averages[0],
        average2: averages[1],
        ratio: ratio,
        useDualAxes: ratio > 10
      });
      
      return ratio > 10; // Use threshold of 10 for dual axes (was 100)
    } catch (error) {
      console.error('[DEBUG-BROWSER] Error in dual Y-axis calculation:', error);
      return false; // Default to single axis on error
    }
  }, [tickers, combinedChartData]);

  // Determine which ticker should go on which axis when using dual axes
  const { leftAxisTicker, rightAxisTicker } = useMemo(() => {
    if (!useDualAxes || !tickers || tickers.length !== 2) {
      return { leftAxisTicker: '', rightAxisTicker: '' };
    }

    try {
      // Calculate averages to decide which goes on which axis
      const averages = tickers.map(ticker => {
        const values = combinedChartData
          .map(point => Number(point[ticker]))
          .filter(value => !isNaN(value));
        
        return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
      });

      // Larger values go on the left, smaller on the right (convention)
      if (averages[0] > averages[1]) {
        return { leftAxisTicker: tickers[0], rightAxisTicker: tickers[1] };
      } else {
        return { leftAxisTicker: tickers[1], rightAxisTicker: tickers[0] };
      }
    } catch (error) {
      console.error('[DEBUG-BROWSER] Error determining axis assignment:', error);
      return { leftAxisTicker: tickers[0], rightAxisTicker: tickers[1] }; // Default assignment
    }
  }, [useDualAxes, tickers, combinedChartData]);

  // Debug the chart rendering state
  console.log('[DEBUG-BROWSER] Chart rendering state:', {
    hasData,
    hasValidUniverseData,
    tickersLength: tickers?.length,
    dataPointsCount: combinedChartData?.length,
    useDualAxes
  });

  // Add more detailed chart data debugging
  console.log('[DEBUG-BROWSER] Chart data details:', {
    dataPoints: combinedChartData.slice(0, 3),
    tickers,
    tickerValues: tickers.map(ticker => 
      combinedChartData.slice(0, 3).map(point => point[ticker])
    ),
    usingNestedData: !!metadata.data
  });

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
            {useDualAxes && tickers.length === 2 && (
              <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">
                Dual Y-Axes Mode
              </span>
            )}
          </p>
          {useDualAxes && tickers.length === 2 && (
            <div className="text-xs text-muted-foreground mt-1">
              <span style={{ color: CHART_COLORS[0] }}>■</span> {leftAxisTicker} on left axis, 
              <span style={{ color: CHART_COLORS[1] }} className="ml-2">■</span> {rightAxisTicker} on right axis
            </div>
          )}
        </div>
        
        {/* Chart rendering begins */}
        {combinedChartData && combinedChartData.length > 0 ? (
          <div 
            className="relative" 
            style={{ 
              width: '100%', 
              height: '500px', 
              backgroundColor: 'rgba(0,0,0,0.1)',
              marginTop: '10px',
              marginBottom: '20px'
            }}
          >
            <ResponsiveContainer width="100%" height="100%" key={`chart-container-${tickers.join('-')}`}>
              {(() => {
                // Log datasets for debugging
                console.log('[DEBUG-CHART] Real dataset (first 5):', combinedChartData.slice(0, 5));
                
                // Extract the real tickers from the first data point
                const realTickers = combinedChartData[0] ? 
                    Object.keys(combinedChartData[0]).filter(key => key !== 'date') : 
                    [];
                
                console.log('[DEBUG-CHART] Real tickers found:', realTickers);
                
                // For dual axis implementation
                if (realTickers.length !== 2) {
                  console.log('[DEBUG-CHART] Not using dual axes: Need exactly 2 tickers, got', realTickers.length);
                  
                  // Standard single-axis rendering
                  return (
                    <LineChart
                      data={combinedChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid stroke="rgba(255, 255, 255, 0.1)" />
                      <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.7)" />
                      <YAxis stroke="rgba(255, 255, 255, 0.7)" />
                      <Tooltip />
                      <Legend />
                      {realTickers.map((ticker, index) => (
                        <Line 
                          key={ticker}
                          type="monotone" 
                          dataKey={ticker} 
                          name={ticker}
                          stroke={CHART_COLORS[index % CHART_COLORS.length]} 
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                      ))}
                    </LineChart>
                  );
                }
                
                // For dual axis, determine which ticker goes on which axis
                // Follow the established pattern - typically stock prices (higher values) on left, percentages on right
                const ticker1 = realTickers[0];
                const ticker2 = realTickers[1];
                
                // A simple heuristic: if the ticker name contains "YoY" or "CPI", put it on the right axis
                const rightAxisTicker = ticker1.includes('YoY') || ticker1.includes('CPI') || ticker1.includes('FEDFUNDS') ? ticker1 : ticker2;
                const leftAxisTicker = rightAxisTicker === ticker1 ? ticker2 : ticker1;
                
                console.log('[DEBUG-CHART] Dual axis mode:', {
                  leftAxisTicker,
                  rightAxisTicker
                });
                
                // Dual-axis rendering
                return (
                  <LineChart
                    data={combinedChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.7)" />
                    
                    {/* Left Y-Axis */}
                    <YAxis 
                      yAxisId="left"
                      stroke={CHART_COLORS[0]}
                      domain={['auto', 'auto']}
                      tickFormatter={(value) => value.toFixed(2)}
                    />
                    
                    {/* Right Y-Axis */}
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke={CHART_COLORS[1]}
                      domain={['auto', 'auto']}
                      tickFormatter={(value) => value.toFixed(2)}
                    />
                    
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '6px',
                        padding: '8px'
                      }}
                      formatter={(value, name) => {
                        if (typeof value === 'number') {
                          if (name === rightAxisTicker) {
                            return [`${value.toFixed(2)}%`, name];
                          } else {
                            return [`$${value.toFixed(2)}`, name];
                          }
                        }
                        return [value, name];
                      }}
                      labelFormatter={(date) => {
                        if (typeof date === 'string') {
                          return new Date(date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long', 
                            day: 'numeric'
                          });
                        }
                        return date;
                      }}
                    />
                    <Legend />
                    
                    {/* Left axis line */}
                    <Line 
                      key={leftAxisTicker}
                      type="monotone" 
                      dataKey={leftAxisTicker} 
                      name={leftAxisTicker}
                      stroke={CHART_COLORS[0]} 
                      strokeWidth={2}
                      dot={false}
                      yAxisId="left"
                      isAnimationActive={false}
                    />
                    
                    {/* Right axis line */}
                    <Line 
                      key={rightAxisTicker}
                      type="monotone" 
                      dataKey={rightAxisTicker} 
                      name={rightAxisTicker}
                      stroke={CHART_COLORS[1]} 
                      strokeWidth={2}
                      dot={false}
                      yAxisId="right"
                      isAnimationActive={false}
                    />
                  </LineChart>
                );
              })()}
            </ResponsiveContainer>
          </div>
        ) : (
          // Fallback when chart data is invalid
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="mb-2 text-warning">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Chart rendering issue</h3>
              <p className="text-sm text-muted-foreground mt-1">Unable to display chart due to invalid data format.</p>
              <p className="text-xs text-muted-foreground mt-2">
                Data points: {combinedChartData?.length || 0} | Tickers: {tickers?.join(', ')}
              </p>
            </div>
          </div>
        )}
    </div>
  );
};

/**
 * Fundamental bar chart component that renders quarterly financial data
 */
const FundamentalBarChart = ({ 
  data, 
  metadata,
  metric
}: { 
  data: FundamentalDataRow[], 
  metadata: FundamentalDataMetadata,
  metric: string
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-warning/10 rounded-lg">
        <div className="text-center p-6">
          <div className="inline-block rounded-full h-12 w-12 bg-warning/20 text-warning flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-warning-foreground">No fundamental data available</h3>
          <p className="mt-2 text-sm text-warning/80">No quarterly financial data is available for visualization.</p>
        </div>
      </div>
    );
  }

  // Get unique tickers for grouping
  const tickers = Array.from(new Set(data.map(item => item.ticker)));
  
  // Group data by fiscal period
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.fiscal_period]) {
      acc[item.fiscal_period] = {
        fiscalPeriod: item.fiscal_period,
        reportPeriod: item.report_period
      };
    }
    acc[item.fiscal_period][item.ticker] = item[metric] as number;
    return acc;
  }, {} as Record<string, any>);
  
  // Convert to array and sort by fiscal period
  const chartData = Object.values(groupedData)
    .sort((a, b) => {
      return (a.fiscalPeriod as string).localeCompare(b.fiscalPeriod as string);
    });
  
  // Format large numbers
  const formatValue = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(0)}M`;
    } else {
      return `$${value.toFixed(0)}`;
    }
  };

  // Get readable metric name
  const getMetricDisplayName = (metricName: string) => {
    // Convert snake_case to Title Case
    return metricName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="fundamental-chart-container p-4 bg-background rounded-lg shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {tickers.join(', ')} Quarterly {getMetricDisplayName(metric)}
        </h3>
        <p className="text-sm text-muted-foreground">
          {data.length} data points | 
          <span className="ml-1">
            {metadata.start_date} to {metadata.end_date}
          </span>
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            dataKey="fiscalPeriod"
            stroke="rgba(255, 255, 255, 0.65)"
            tick={{ fill: 'rgba(255, 255, 255, 0.65)' }}
            tickFormatter={(value) => value.split('-')[1]} // Show only quarter
          />
          <YAxis 
            stroke="rgba(255, 255, 255, 0.65)"
            tick={{ fill: 'rgba(255, 255, 255, 0.65)' }}
            tickFormatter={formatValue}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              padding: '8px'
            }}
            formatter={(value, name) => [formatValue(value as number), name]}
            labelFormatter={(fiscalPeriod) => `Fiscal ${fiscalPeriod}`}
          />
          <Legend />
          
          {tickers.map((ticker, index) => (
            <Bar 
              key={ticker}
              dataKey={ticker}
              name={ticker}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
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
      
      // Create base metadata update
      setMetadata((currentMetadata) => {
        const newMetadata = {
          ...currentMetadata,
          status: status.status,
          visualizationReady: status.visualizationReady ?? currentMetadata.visualizationReady,
          error: status.error,
          details: status.details,
          isTimeout: status.isTimeout
        };

        // If this is a fundamental data response
        if (status.hasFundamentalData && status.fundamentalData) {
          console.log('[DEBUG-BROWSER] Received fundamental data:', {
            dataLength: status.fundamentalData.data?.length,
            metrics: status.fundamentalData.metadata?.columns,
            selectedMetric: status.selectedFundamentalMetric
          });
          
          return {
            ...newMetadata,
            hasFundamentalData: true,
            fundamentalData: status.fundamentalData,
            selectedFundamentalMetric: status.selectedFundamentalMetric || 
              (status.fundamentalData.data && status.fundamentalData.data[0] ? 
                // Find first property that's not ticker, report_period, or fiscal_period
                Object.keys(status.fundamentalData.data[0]).find(key => 
                  !['ticker', 'report_period', 'fiscal_period'].includes(key)
                ) : 'revenue')
          };
        }

        // If this is a universe data response
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