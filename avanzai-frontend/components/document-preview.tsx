'use client';

import {
  memo,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { ArtifactKind, UIArtifact } from './artifact';
import { FileIcon, FullscreenIcon, ImageIcon, LoaderIcon } from './icons';
import { cn, fetcher } from '@/lib/utils';
import { Document } from '@/lib/db/schema';
import { InlineDocumentSkeleton } from './document-skeleton';
import useSWR from 'swr';
import { Editor } from './text-editor';
import { DocumentToolCall, DocumentToolResult } from './document';
import { CodeEditor } from './code-editor';
import { useArtifact } from '@/hooks/use-artifact';
import equal from 'fast-deep-equal';
import { SpreadsheetEditor } from './sheet-editor';
import { ImageEditor } from './image-editor';
import { TabbedSheetEditor } from './tabbed-sheet-editor';
import { ResponsiveContainer, LineChart, Line, YAxis, BarChart, Bar, XAxis } from 'recharts';
import { FinancialMetadata, ProcessedTimeSeriesData, UniverseDataRow } from '@/lib/models/financial-data';

interface DocumentPreviewProps {
  isReadonly: boolean;
  result?: any;
  args?: any;
}

interface TimeSeriesDataPoint {
  timestamp: number;
  value: number;
}

interface TickerData {
  [ticker: string]: TimeSeriesDataPoint[];
}

interface ChartDataPoint {
  date: string;
  [ticker: string]: number | string;  // Allow string for date and numbers for values
}

interface EnhancedFinancialMetadata extends FinancialMetadata {
  processedChartData?: ChartDataPoint[];
}

export function DocumentPreview({
  isReadonly,
  result,
  args,
}: DocumentPreviewProps) {
  const { artifact, setArtifact, setMetadata } = useArtifact();

  // Get chatId from result or args
  const chatId = result?.chatId || args?.chatId;
  
  console.log('[DEBUG-BROWSER] DocumentPreview initializing:', {
    chatId,
    result: result ? { chatId: result.chatId, title: result.title } : 'none',
    args: args ? { chatId: args.chatId, title: args.title } : 'none'
  });

  // Validate result and args for financial data
  if (result?.kind === 'financial' || args?.kind === 'financial') {
    if (!chatId) {
      console.error('[DEBUG-BROWSER] Missing chatId for financial document');
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg text-red-500">
          Error: Invalid financial data (missing ID)
        </div>
      );
    }
  }

  // Only fetch if we have a valid chatId
  const { data: previewDocument, isLoading: isDocumentsFetching, error } = useSWR<Document>(
    chatId ? `/api/documents/${chatId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      onError: (err) => console.log('[DEBUG-BROWSER] Document fetch error:', err)
    }
  );

  // Log fetch results
  useEffect(() => {
    if (previewDocument) {
      console.log('[DEBUG-BROWSER] Document fetched:', {
        chatId,
        id: previewDocument.id,
        kind: previewDocument.kind
      });
    }
  }, [previewDocument, chatId]);

  // Use preview document if available, otherwise create a new one from result/args
  const document = useMemo(() => {
    // If we don't have a valid chatId, don't create a document
    if (!chatId) {
      console.log('[DEBUG-BROWSER] No valid chatId available for document');
      return null;
    }

    // If we have a preview document from the database, use that
    if (previewDocument) {
      return previewDocument;
    }

    // For financial documents, ensure we have required fields
    if (result?.kind === 'financial' || args?.kind === 'financial') {
      const title = result?.title || args?.title;
      if (!title) {
        console.error('[DEBUG-BROWSER] Missing title for financial document');
        return null;
      }
    }

    // If we're streaming and have metadata in the artifact, use that
    if (artifact.status === 'streaming' && artifact.metadata) {
      return {
        title: result?.title || args?.title,
        kind: result?.kind || args?.kind,
        content: result?.content || args?.content || '',
        id: chatId,
        chatId,
        createdAt: new Date(),
        userId: 'noop',
        metadata: artifact.metadata
      };
    }

    // Otherwise create a new document with metadata from result/args
    return {
      title: result?.title || args?.title,
      kind: result?.kind || args?.kind,
      content: result?.content || args?.content || '',
      id: chatId,
      chatId,
      createdAt: new Date(),
      userId: 'noop',
      metadata: result?.metadata || args?.metadata || null
    };
  }, [previewDocument, result, args, chatId, artifact.status, artifact.metadata]);

  // For template documents, set up the artifact view
  useEffect(() => {
    if (document?.metadata?.isTemplate && document.chatId) {
      setArtifact({
        title: 'Financial Templates',
        documentId: document.chatId,
        kind: 'sheet',
        content: document.content || '',
        isVisible: true,
        status: 'idle',
        metadata: {
          templateType: 'assumptions',
          isTemplate: true
        },
        boundingBox: {
          left: 0,
          top: 0,
          width: 0,
          height: 0
        }
      });
    }
  }, [document, setArtifact]);

  // Show loading state while fetching
  if (isDocumentsFetching) {
    return <LoadingSkeleton artifactKind={result?.kind || args?.kind} />;
  }

  // Handle fetch errors
  if (error) {
    console.error('[DEBUG-BROWSER] Error fetching document:', error);
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg text-red-500">
        Error loading document
      </div>
    );
  }

  // Don't render if we don't have a valid document
  if (!document) {
    console.log('[DEBUG-BROWSER] No valid document to render');
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg text-red-500">
        Error: Invalid document data
      </div>
    );
  }

  // For templates, show a clickable preview that opens the full view
  if (document?.metadata?.isTemplate) {
    return (
      <div 
        className="flex flex-col size-full relative cursor-pointer" 
        onClick={() => {
          setArtifact({
            title: 'Financial Templates',
            documentId: document.chatId,
            kind: 'sheet',
            content: document.content || '',
            isVisible: true,
            status: 'idle',
            metadata: {
              templateType: 'assumptions',
              isTemplate: true
            },
            boundingBox: {
              left: 0,
              top: 0,
              width: 0,
              height: 0
            }
          });
        }}
      >
        <DocumentHeader title="Financial Templates" kind={document.kind} />
        <div className={cn(
          'h-[257px] overflow-y-scroll border rounded-b-2xl dark:bg-muted border-t-0 dark:border-zinc-700 p-4',
          'flex items-center justify-center text-muted-foreground'
        )}>
          Click to view Financial Templates
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col size-full relative">
      <DocumentHeader title={document.title} kind={document.kind} />
      <DocumentContent document={document} isReadonly={isReadonly} />
      <HitboxLayer
        result={document}  // Pass the full document instead of just result
        setArtifact={setArtifact}
      />
    </div>
  );
}

const LoadingSkeleton = ({ artifactKind }: { artifactKind: ArtifactKind }) => (
  <div className="w-full">
    <div className="p-4 border rounded-t-2xl flex flex-row gap-2 items-center justify-between dark:bg-muted h-[57px] dark:border-zinc-700 border-b-0">
      <div className="flex flex-row items-center gap-3">
        <div className="text-muted-foreground">
          <div className="animate-pulse rounded-md size-4 bg-muted-foreground/20" />
        </div>
        <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-24" />
      </div>
      <div>
        <FullscreenIcon />
      </div>
    </div>
    {artifactKind === 'image' ? (
      <div className="overflow-y-scroll border rounded-b-2xl bg-muted border-t-0 dark:border-zinc-700">
        <div className="animate-pulse h-[257px] bg-muted-foreground/20 w-full" />
      </div>
    ) : (
      <div className="overflow-y-scroll border rounded-b-2xl p-8 pt-4 bg-muted border-t-0 dark:border-zinc-700">
        <InlineDocumentSkeleton />
      </div>
    )}
  </div>
);

const PureHitboxLayer = ({
  result,
  setArtifact,
}: {
  result: any;
  setArtifact: (
    updaterFn: UIArtifact | ((currentArtifact: UIArtifact) => UIArtifact),
  ) => void;
}) => {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      // Don't do anything if we don't have a valid chatId
      if (!result?.chatId) {
        console.log('[DEBUG-BROWSER] No chatId available for artifact');
        return;
      }

      const boundingBox = event.currentTarget.getBoundingClientRect();

      console.log('[DEBUG-BROWSER] Opening artifact:', {
        chatId: result.chatId,
        title: result.title,
        content: result.content ? result.content.slice(0, 50) : 'no-content'
      });

      setArtifact({
        title: result.title || 'Document',
        documentId: result.chatId,
        kind: result.kind || 'sheet',
        content: result.content || '',
        isVisible: true,
        status: 'idle',
        metadata: result.metadata || null,
        boundingBox: {
          left: boundingBox.x,
          top: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height,
        }
      });
    },
    [setArtifact, result],
  );

  // Don't render the button if we don't have a valid chatId
  if (!result?.chatId) {
    return null;
  }

  return (
    <div className="absolute top-4 right-4">
      <button 
        className="p-2 hover:dark:bg-zinc-700 rounded-md hover:bg-zinc-100"
        onClick={handleClick}
      >
        <FullscreenIcon />
      </button>
    </div>
  );
};

const HitboxLayer = memo(PureHitboxLayer, (prevProps, nextProps) => {
  if (!equal(prevProps.result, nextProps.result)) return false;
  return true;
});

const PureDocumentHeader = ({
  title,
  kind,
}: {
  title: string;
  kind: ArtifactKind;
}) => (
  <div className="p-4 border rounded-t-2xl flex flex-row gap-2 items-start sm:items-center justify-between dark:bg-muted border-b-0 dark:border-zinc-700">
    <div className="flex flex-row items-start sm:items-center gap-3">
      <div className="text-muted-foreground">
        {kind === 'image' ? (
          <ImageIcon />
        ) : (
          <FileIcon />
        )}
      </div>
      <div className="-translate-y-1 sm:translate-y-0 font-medium">{title}</div>
    </div>
    <div className="w-8" />
  </div>
);

const DocumentHeader = memo(PureDocumentHeader, (prevProps, nextProps) => {
  if (prevProps.title !== nextProps.title) return false;

  return true;
});

const DocumentContent = ({ document, isReadonly }: { document: Document; isReadonly: boolean }) => {
  const { artifact, setArtifact, setMetadata } = useArtifact();
  const documentKind = document.kind as ArtifactKind;
  
  const containerClassName = cn(
    'h-[257px] overflow-y-scroll border rounded-b-2xl dark:bg-muted border-t-0 dark:border-zinc-700',
    {
      'p-4': documentKind !== 'image',
      'p-0': documentKind === 'image'
    }
  );

  // For sheets, just use document content
  const displayContent = document?.content || '';

  // Ensure we have a valid chatId before passing to editors
  const validChatId = document?.chatId;
  if ((documentKind === 'sheet' || documentKind === 'financial') && !validChatId) {
    return <LoadingSkeleton artifactKind={(documentKind as ArtifactKind) || 'text'} />;
  }

  // For templates, make the content area clickable to open the full view
  if (document?.metadata?.isTemplate) {
    return (
      <div 
        className={cn(containerClassName, 'cursor-pointer flex items-center justify-center')}
        onClick={() => {
          setArtifact({
            title: 'Financial Templates',
            documentId: document.chatId,
            kind: 'sheet',
            content: document.content || '',
            isVisible: true,
            status: 'idle',
            metadata: {
              templateType: 'assumptions',
              isTemplate: true
            },
            boundingBox: {
              left: 0,
              top: 0,
              width: 0,
              height: 0
            }
          });
        }}
      >
        Click to view Financial Templates
      </div>
    );
  }
  
  // For financial documents, show a preview that opens the full visualization
  if (documentKind === 'financial') {
    // Create default metadata if none exists or invalid
    const defaultMetadata = {
      status: 'loading',
      visualizationReady: false,
      symbol: document.title?.replace('Financial Data: ', '') || 'AAPL',
      timeSeriesData: [],
      dataPoints: 0,
      loadedPoints: 0,
      metrics: [],
      dataId: document.id,
      sessionId: document.chatId
    };

    // Parse document content to recover metadata if available
    let parsedMetadata = null;
    try {
      if (document.content) {
        console.log('[DEBUG-BROWSER] Attempting to parse document content:', {
          documentId: document.id,
          chatId: document.chatId,
          title: document.title,
          contentStart: document.content.substring(0, 100) + '...',
          contentType: typeof document.content,
          contentLength: document.content.length
        });
        
        parsedMetadata = JSON.parse(document.content);
        console.log('[DEBUG-BROWSER] Parsed financial metadata:', parsedMetadata);
        
        // Add more detailed debugging for universe data or its absence
        if (parsedMetadata.universeData) {
          console.log('[DEBUG-BROWSER] Found universe data:', {
            metricName: parsedMetadata.universeData.metadata?.metric || 'undefined',
            dataLength: parsedMetadata.universeData.data?.length || 0,
            firstItem: parsedMetadata.universeData.data?.[0] || 'no data items',
            firstTotalReturn: parsedMetadata.universeData.data?.[0]?.total_return || 'no total_return value',
            isDataArray: Array.isArray(parsedMetadata.universeData.data),
            status: parsedMetadata.status
          });
        } else {
          console.log('[DEBUG-BROWSER] No universe data found. Document content contains:', {
            keys: Object.keys(parsedMetadata),
            status: parsedMetadata.status,
            hasTickerData: !!parsedMetadata.tickerData,
            hasTimeSeriesData: !!parsedMetadata.timeSeriesData
          });
        }
      } else {
        console.log('[DEBUG-BROWSER] No document content to parse');
      }
    } catch (e) {
      console.error('[DEBUG-BROWSER] Error parsing financial metadata:', e);
      console.log('[DEBUG-BROWSER] Raw document content sample:', document.content?.substring(0, 200));
    }
    
    // Validate metadata structure
    const metadata = parsedMetadata || document.metadata || defaultMetadata;
    const isValidMetadata = metadata && 
      ((metadata.status === 'error' && metadata.error) || // Either it's an error with a message
       (metadata.status === 'ready' && // Or it's ready
        (metadata.tickerData || metadata.timeSeriesData || metadata.universeData || metadata.fundamentalData))); // And has some data

    if (!isValidMetadata) {
      console.error('[DEBUG-BROWSER] Invalid financial metadata structure:', {
        hasStatus: 'status' in metadata,
        hasTickerData: 'tickerData' in metadata && typeof metadata.tickerData === 'object',
        hasTimeSeriesData: 'timeSeriesData' in metadata && Array.isArray(metadata.timeSeriesData),
        hasFundamentalData: 'fundamentalData' in metadata && typeof metadata.fundamentalData === 'object',
        hasTickers: 'tickers' in metadata && Array.isArray(metadata.tickers),
        tickerCount: metadata.tickers?.length,
        metadata
      });
      return (
        <div className={cn(containerClassName, 'flex items-center justify-center text-red-500')}>
          Error: Invalid financial data format
        </div>
      );
    }

    const typedMetadata = metadata as FinancialMetadata;
    
    // If status is 'ready' and visualizationReady is missing, we can infer it should be true
    const shouldBeReady = typedMetadata.status === 'ready' && 
      (typedMetadata.tickerData ? 
        Object.values(typedMetadata.tickerData).some(data => (data || []).length > 0) :
        (typedMetadata.timeSeriesData || []).length > 0);
    
    // Initialize metadata in the artifact store if not already set
    useEffect(() => {
      if (document.id && typedMetadata.status === 'ready' && typedMetadata.tickers && typedMetadata.tickers.length > 0) {
        // Only process the data if we haven't already
        const enhancedMetadata = typedMetadata as EnhancedFinancialMetadata;
        if (!enhancedMetadata.processedChartData) {
          console.log('[DEBUG-BROWSER] Processing chart data once');
          
          // Create combined data format (just once)
          const dateMap = new Map<string, ChartDataPoint>();
          const tickers = typedMetadata.tickers || [];
          
          // Process each ticker's data into the combined format
          tickers.forEach(ticker => {
            const tickerData = typedMetadata.tickerData?.[ticker] || [];
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
          
          // Convert to sorted array
          const combinedChartData = Array.from(dateMap.values())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          // Add processed data to metadata
          const newMetadata: EnhancedFinancialMetadata = {
            ...enhancedMetadata,
            processedChartData: combinedChartData
          };
          
          // Store in metadata
          setMetadata(newMetadata);
        }
      }
    }, [document.id, typedMetadata, setMetadata]);
    
    return (
      <div 
        className={cn(containerClassName, 'cursor-pointer')}
        onClick={() => {
          console.log('[DEBUG-BROWSER] Opening financial artifact with metadata:', {
            id: document.id,
            metadata: parsedMetadata,
            status: parsedMetadata.status,
            dataPoints: parsedMetadata.timeSeriesData?.length || 0,
            visualizationReady: parsedMetadata.visualizationReady || shouldBeReady
          });
          
          // Set both the artifact metadata and the separate metadata store
          setMetadata(parsedMetadata);
          
          setArtifact(prev => {
            console.log('[DEBUG-BROWSER] Previous artifact state:', prev);
            const newState = {
              title: document.title || 'Financial Data',
              documentId: document.id,
              kind: 'financial' as ArtifactKind,
              content: document.content || '',
              isVisible: true,
              status: parsedMetadata.status || 'idle',
              metadata: parsedMetadata,
              boundingBox: {
                left: 0,
                top: 0,
                width: 0,
                height: 0
              }
            };
            console.log('[DEBUG-BROWSER] New artifact state:', newState);
            return newState;
          });
        }}
      >
        {parsedMetadata.status === 'ready' && parsedMetadata.visualizationReady ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                {parsedMetadata.universeData && parsedMetadata.universeData.metadata ? (
                  <span className="text-sm font-medium">{parsedMetadata.universeData.metadata.metric || 'Universe'} Ranking</span>
                ) : parsedMetadata.fundamentalData && parsedMetadata.selectedFundamentalMetric ? (
                  <span className="text-sm font-medium">
                    {parsedMetadata.tickers?.join(', ') || 'Financial'} {parsedMetadata.selectedFundamentalMetric.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                ) : (
                  <span className="text-sm font-medium">{parsedMetadata.tickers?.join(', ') || 'Financial'} Price History</span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {parsedMetadata.universeData && parsedMetadata.universeData.data ? 
                  `${parsedMetadata.universeData.data.length || 0} stocks` : 
                  `${Object.values(parsedMetadata.tickerData as TickerData || {}).reduce((sum, data) => sum + (data?.length || 0), 0)} points`
                }
              </span>
            </div>
            
            {/* Preview chart - show either line chart or bar chart depending on data type */}
            <div className="flex-1 min-h-[100px]">
              {(() => {
                if (parsedMetadata.universeData && 
                    parsedMetadata.universeData.data && 
                    Array.isArray(parsedMetadata.universeData.data) && 
                    parsedMetadata.universeData.data.length > 0) {
                  
                  // Debug logs before render
                  console.log('[DEBUG-BROWSER] About to render universe bar chart:', {
                    dataLength: parsedMetadata.universeData.data.length,
                    firstItem: parsedMetadata.universeData.data[0],
                    previewData: parsedMetadata.universeData.data.slice(0, 5),
                    metadata: parsedMetadata.universeData.metadata,
                  });
                  
                  console.log('[DEBUG-BROWSER] Bar chart render:', {
                    chartData: parsedMetadata.universeData.data.slice(0, 5).map((d: UniverseDataRow) => ({
                      ticker: d.ticker,
                      total_return: d.total_return,
                      rank: d.rank
                    }))
                  });
                  
                  return (
                    <ResponsiveContainer width="100%" height={100}>
                      <BarChart
                        data={parsedMetadata.universeData.data.slice(0, 5)}
                        layout="vertical"
                        margin={{ top: 5, right: 5, left: 35, bottom: 5 }}
                      >
                        <XAxis 
                          type="number" 
                          hide 
                          domain={[0, parsedMetadata.universeData.data.length > 0 ? 
                            Math.max(...parsedMetadata.universeData.data.slice(0, 5).map((d: UniverseDataRow) => d.total_return)) : 
                            1]} 
                        />
                        <YAxis 
                          type="category" 
                          dataKey="ticker" 
                          tick={{ fontSize: 10, fill: 'rgba(255, 255, 255, 0.65)' }}
                          width={30}
                        />
                        <Bar 
                          dataKey="total_return" 
                          fill="#3b82f6" 
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  );
                } else if (parsedMetadata.fundamentalData && 
                          parsedMetadata.fundamentalData.data && 
                          Array.isArray(parsedMetadata.fundamentalData.data) && 
                          parsedMetadata.fundamentalData.data.length > 0 &&
                          parsedMetadata.selectedFundamentalMetric) {
                  
                  console.log('[DEBUG-BROWSER] About to render fundamental bar chart:', {
                    dataLength: parsedMetadata.fundamentalData.data.length,
                    firstItem: parsedMetadata.fundamentalData.data[0],
                    metric: parsedMetadata.selectedFundamentalMetric
                  });
                  
                  // Get unique tickers and prepare preview data
                  const tickers = Array.from(new Set(parsedMetadata.fundamentalData.data.map((item: any) => item.ticker)));
                  const metric = parsedMetadata.selectedFundamentalMetric;
                  
                  // Take a sample of the data for the preview (most recent quarters)
                  const previewData = [...parsedMetadata.fundamentalData.data]
                    .sort((a: any, b: any) => b.fiscal_period.localeCompare(a.fiscal_period))
                    .slice(0, 8);
                  
                  // Group by fiscal period
                  const groupedData = previewData.reduce((acc: Record<string, any>, item: any) => {
                    if (!acc[item.fiscal_period]) {
                      acc[item.fiscal_period] = {
                        fiscalPeriod: item.fiscal_period,
                        reportPeriod: item.report_period
                      };
                    }
                    acc[item.fiscal_period][item.ticker] = item[metric] as number;
                    return acc;
                  }, {} as Record<string, any>);
                  
                  // Convert to array and take 5 most recent quarters
                  const chartData = Object.values(groupedData)
                    .sort((a: any, b: any) => (b.fiscalPeriod as string).localeCompare(a.fiscalPeriod as string))
                    .slice(0, 5)
                    .reverse(); // Put in chronological order
                  
                  return (
                    <ResponsiveContainer width="100%" height={100}>
                      <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <XAxis 
                          dataKey="fiscalPeriod"
                          tick={{ fontSize: 8, fill: 'rgba(255, 255, 255, 0.65)' }}
                          tickFormatter={(value: string) => value.split('-')[1]} // Show only quarter
                        />
                        <YAxis hide />
                        {(tickers as string[]).slice(0, 2).map((ticker: string, index: number) => (
                          <Bar 
                            key={ticker}
                            dataKey={ticker}
                            name={ticker}
                            fill={["#3b82f6", "#ef4444"][index % 2]}
                            radius={[4, 4, 0, 0]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  );
                } else {
                  // Debug log for failed conditions
                  console.log('[DEBUG-BROWSER] Universe/fundamental data conditions not met:', {
                    hasUniverseData: !!parsedMetadata.universeData,
                    hasUniverseConditions: parsedMetadata.universeData?.data ? 
                      Array.isArray(parsedMetadata.universeData.data) && parsedMetadata.universeData.data.length > 0 : false,
                    hasFundamentalData: !!parsedMetadata.fundamentalData,
                    hasFundamentalConditions: parsedMetadata.fundamentalData?.data ? 
                      Array.isArray(parsedMetadata.fundamentalData.data) && 
                      parsedMetadata.fundamentalData.data.length > 0 && 
                      !!parsedMetadata.selectedFundamentalMetric : false
                  });
                  
                  // Return time series chart
                  return (
                    <ResponsiveContainer width="100%" height={100}>
                      <LineChart
                        data={(() => {
                          const enhancedMetadata = parsedMetadata as EnhancedFinancialMetadata;
                          const processedData = enhancedMetadata.processedChartData;
                          const firstTicker = parsedMetadata.tickers?.[0] || '';
                          
                          if (processedData && processedData.length > 0) {
                            return processedData.map(point => ({
                              timestamp: point.date,
                              value: typeof point[firstTicker] === 'number' ? (point[firstTicker] as number) : 0
                            }));
                          }
                          
                          return parsedMetadata.tickerData?.[firstTicker] || [];
                        })()}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3b82f6" 
                          dot={false}
                          strokeWidth={1}
                        />
                        <YAxis 
                          hide 
                          domain={['auto', 'auto']}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  );
                }
              })()}
            </div>
            
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              {parsedMetadata.universeData && 
                parsedMetadata.universeData.data && 
                Array.isArray(parsedMetadata.universeData.data) && 
                parsedMetadata.universeData.data.length > 0 ? (
                // Universe data footer
                <div className="w-full text-center">Click to view complete ranking</div>
              ) : parsedMetadata.fundamentalData && 
                  parsedMetadata.fundamentalData.data && 
                  Array.isArray(parsedMetadata.fundamentalData.data) && 
                  parsedMetadata.fundamentalData.data.length > 0 ? (
                // Fundamental data footer
                <div className="w-full text-center">Click to view full quarterly data</div>
              ) : (
                // Time series footer (existing code)
                parsedMetadata.tickers?.[0] && parsedMetadata.tickerData?.[parsedMetadata.tickers[0]]?.length > 0 && (
                  <>
                    <span>
                      {new Date(parsedMetadata.tickerData[parsedMetadata.tickers[0]][0]?.timestamp).toLocaleDateString()}
                    </span>
                    <span>Click to expand</span>
                    <span>
                      {new Date(parsedMetadata.tickerData[parsedMetadata.tickers[0]][parsedMetadata.tickerData[parsedMetadata.tickers[0]].length - 1]?.timestamp).toLocaleDateString()}
                    </span>
                  </>
                )
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {document.title || 'Financial Data'}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Loading data... ({parsedMetadata.loadedPoints}/{parsedMetadata.dataPoints || '?'} points)
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // For text documents
  if (documentKind === 'text' as ArtifactKind) {
    return (
      <div className={containerClassName}>
        <Editor
          content={displayContent}
          isCurrentVersion={true}
          currentVersionIndex={0}
          status={artifact.status}
          onSaveContent={() => {}}
          suggestions={[]}
        />
      </div>
    );
  }

  // For code documents
  if (documentKind === 'code' as ArtifactKind) {
    return (
      <div className="flex flex-1 relative w-full">
        <div className="absolute inset-0">
          <CodeEditor
            content={displayContent}
            isCurrentVersion={true}
            currentVersionIndex={0}
            status={artifact.status}
            onSaveContent={() => {}}
            suggestions={[]}
          />
        </div>
      </div>
    );
  }

  // For sheet documents
  if (documentKind === 'sheet' as ArtifactKind) {
    return (
      <div className="flex flex-1 relative size-full p-4">
        <div className="absolute inset-0">
          <TabbedSheetEditor
            content={displayContent}
            isCurrentVersion={true}
            currentVersionIndex={0}
            status={artifact.status}
            saveContent={() => {}}
            chatId={validChatId}
          />
        </div>
      </div>
    );
  }

  // For image documents
  if (documentKind === 'image' as ArtifactKind) {
    return (
      <ImageEditor
        title={document.title}
        content={document.content || ''}
        isCurrentVersion={true}
        currentVersionIndex={0}
        status={artifact.status}
        isInline={true}
      />
    );
  }

  return null;
};
