'use client';

import { useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import { useArtifact } from '@/hooks/use-artifact';
import { artifactDefinitions, ArtifactKind } from './artifact';
import { initialArtifactData } from '@/hooks/use-artifact';
import { Suggestion } from '@/lib/db/schema';

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
    | 'metadata';
  content: string | Suggestion;
};

export function DataStreamHandler({ id }: { id: string }) {
  const { data: dataStream } = useChat({ id });
  const { artifact, setArtifact, setMetadata } = useArtifact();
  const lastProcessedIndex = useRef(-1);

  useEffect(() => {
    if (!dataStream?.length) return;

    const newDeltas = dataStream.slice(lastProcessedIndex.current + 1);
    lastProcessedIndex.current = dataStream.length - 1;

    console.log('[DEBUG-STREAM] Processing new deltas:', newDeltas.length);

    (newDeltas as DataStreamDelta[]).forEach((delta: DataStreamDelta) => {
      console.log('[DEBUG-STREAM] Processing delta:', {
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