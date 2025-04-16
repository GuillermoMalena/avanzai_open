'use client';

import { useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import { useArtifact } from '@/hooks/use-artifact';
import { artifactDefinitions, ArtifactKind } from './artifact';
import { initialArtifactData } from '@/hooks/use-artifact';
import { Suggestion } from '@/lib/db/schema';

export type ToolLoadingContent = {
  tool: string;
  isLoading: boolean;
  message?: string;
};

export type QueryLoadingContent = {
  isLoading: boolean;
  taskNames: string[];
  message?: string;
};

export type FinancialToolStatus = {
  tool: 'getStockPrices' | 'getIncomeStatements' | 'getBalanceSheets' | 'getCashFlowStatements' | 'getFinancialMetrics' | 'searchStocksByFilters' | 'getNews';
  status: 'loading' | 'processing' | 'ready' | 'error';
  progress?: {
    current: number;
    total: number;
  };
  message?: string;
  error?: string;
};

export type DataStreamDelta = {
  type:
    | 'text-delta'
    | 'code-delta'
    | 'sheet-delta'
    | 'image-delta'
    | 'title'
    | 'id'
    | 'suggestion'
    | 'clear'
    | 'finish'
    | 'kind'
    | 'metadata'
    | 'tool-loading'
    | 'query-loading'
    | 'financial-tool-status';
  content: string | Suggestion | ToolLoadingContent | QueryLoadingContent | FinancialToolStatus;
};

// Type guard for financial tool status
const isFinancialToolStatus = (content: any): content is FinancialToolStatus => {
  return content?.tool !== undefined && content?.status !== undefined;
};

// Type guard for tool loading content
const isToolLoadingContent = (content: any): content is ToolLoadingContent => {
  return content?.tool !== undefined && typeof content?.isLoading === 'boolean';
};

// Type guard for query loading content
const isQueryLoadingContent = (content: any): content is QueryLoadingContent => {
  return Array.isArray(content?.taskNames) && typeof content?.isLoading === 'boolean';
};

export function DataStreamHandler({ id }: { id: string }) {
  const { data: dataStream } = useChat({ id });
  const { artifact, setArtifact, setMetadata } = useArtifact();
  const lastProcessedIndex = useRef(-1);

  // Add component mount/unmount logging
  useEffect(() => {
    console.log(`[DEBUG-STREAM] DataStreamHandler MOUNTED for chat id: ${id}`);
    return () => {
      console.log(`[DEBUG-STREAM] DataStreamHandler UNMOUNTED for chat id: ${id}`);
    };
  }, [id]);

  useEffect(() => {
    if (!dataStream?.length) return;

    const newDeltas = dataStream.slice(lastProcessedIndex.current + 1);
    lastProcessedIndex.current = dataStream.length - 1;

    console.log('[DEBUG-STREAM] Processing new deltas:', newDeltas.length);

    (newDeltas as DataStreamDelta[]).forEach((delta: DataStreamDelta, index) => {
      console.log(`[DEBUG-STREAM] Delta #${index}:`, {
        type: delta.type,
        contentType: typeof delta.content,
        isObject: typeof delta.content === 'object',
        content: delta.content,
        isFinancialToolStatus: typeof delta.content === 'object' ? isFinancialToolStatus(delta.content) : false,
        isToolLoadingContent: typeof delta.content === 'object' ? isToolLoadingContent(delta.content) : false,
        isQueryLoadingContent: typeof delta.content === 'object' ? isQueryLoadingContent(delta.content) : false,
      });

      // Skip raw tool responses by checking if the content is a tool result object
      if (typeof delta.content === 'object' && !isFinancialToolStatus(delta.content) && 
          !isToolLoadingContent(delta.content) && !isQueryLoadingContent(delta.content) &&
          delta.type !== 'suggestion') {
        console.log(`[DEBUG-STREAM] SKIPPING DELTA #${index} - Identified as raw tool response:`, delta);
        return;
      }

      console.log(`[DEBUG-STREAM] PROCESSING DELTA #${index}:`, {
        type: delta.type,
        content: delta.type === 'metadata' ? JSON.parse(delta.content as string) : delta.content
      });

      const artifactDefinition = artifactDefinitions.find(
        (def) => def.kind === artifact.kind,
      );

      if (artifactDefinition?.onStreamPart) {
        console.log('[DEBUG-STREAM] Calling onStreamPart for artifact kind:', artifact.kind);
        artifactDefinition.onStreamPart({
          streamPart: delta,
          setArtifact,
          setMetadata,
        });
      }

      setArtifact((draftArtifact) => {
        if (!draftArtifact) {
          console.log('[DEBUG-STREAM] Creating new artifact');
          return { ...initialArtifactData, status: 'streaming' };
        }

        switch (delta.type) {
          case 'id':
            console.log('[DEBUG-STREAM] Setting document ID:', delta.content);
            return {
              ...draftArtifact,
              documentId: delta.content as string,
              status: 'streaming',
            };

          case 'title':
            console.log('[DEBUG-STREAM] Setting title:', delta.content);
            return {
              ...draftArtifact,
              title: delta.content as string,
              status: 'streaming',
            };

          case 'kind':
            console.log('[DEBUG-STREAM] Setting kind:', delta.content);
            return {
              ...draftArtifact,
              kind: delta.content as ArtifactKind,
              status: 'streaming',
            };

          case 'clear':
            console.log('[DEBUG-STREAM] Clearing content');
            return {
              ...draftArtifact,
              content: '',
              status: 'streaming',
            };

          case 'metadata':
            const metadata = JSON.parse(delta.content as string);
            console.log('[DEBUG-STREAM] Setting metadata:', metadata);
            return {
              ...draftArtifact,
              metadata,
              status: 'streaming',
            };

          case 'financial-tool-status':
            if (isFinancialToolStatus(delta.content)) {
              console.log('[DEBUG-STREAM] Updating financial tool status:', delta.content);
              return {
                ...draftArtifact,
                metadata: {
                  ...draftArtifact.metadata,
                  toolStatus: {
                    ...draftArtifact.metadata?.toolStatus,
                    [delta.content.tool]: delta.content
                  }
                },
                status: 'streaming',
              };
            }
            return draftArtifact;

          case 'tool-loading':
            if (isToolLoadingContent(delta.content)) {
              console.log('[DEBUG-STREAM] Updating tool loading status:', delta.content);
              return {
                ...draftArtifact,
                metadata: {
                  ...draftArtifact.metadata,
                  toolLoading: {
                    ...draftArtifact.metadata?.toolLoading,
                    [delta.content.tool]: delta.content
                  }
                },
                status: 'streaming',
              };
            }
            return draftArtifact;

          case 'query-loading':
            if (isQueryLoadingContent(delta.content)) {
              console.log('[DEBUG-STREAM] Updating query loading status:', delta.content);
              return {
                ...draftArtifact,
                metadata: {
                  ...draftArtifact.metadata,
                  queryLoading: delta.content
                },
                status: 'streaming',
              };
            }
            return draftArtifact;

          case 'finish':
            console.log('[DEBUG-STREAM] Finishing stream');
            return {
              ...draftArtifact,
              status: 'idle',
            };

          default:
            return draftArtifact;
        }
      });
    });
  }, [dataStream, setArtifact, setMetadata, artifact]);

  return null;
} 