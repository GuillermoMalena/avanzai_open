'use client';

import useSWR from 'swr';
import { UIArtifact } from '@/components/artifact';
import { useCallback, useMemo, useEffect } from 'react';

export const initialArtifactData: UIArtifact = {
  documentId: 'init',
  content: '',
  kind: 'text',
  title: '',
  status: 'idle',
  isVisible: false,
  boundingBox: {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  },
};

type Selector<T> = (state: UIArtifact) => T;

export function useArtifactSelector<Selected>(selector: Selector<Selected>) {
  const { data: localArtifact } = useSWR<UIArtifact>('artifact', null, {
    fallbackData: initialArtifactData,
  });

  const selectedValue = useMemo(() => {
    if (!localArtifact) return selector(initialArtifactData);
    return selector(localArtifact);
  }, [localArtifact, selector]);

  return selectedValue;
}

export function useArtifact() {
  const { data: localArtifact, mutate: setLocalArtifact } = useSWR<UIArtifact>(
    'artifact',
    null,
    {
      fallbackData: initialArtifactData,
    },
  );

  // Add debug logging for status changes
  useEffect(() => {
    if (localArtifact) {
      console.log(`[useArtifact] Current status: ${localArtifact.status}, isVisible: ${localArtifact.isVisible}, documentId: ${localArtifact.documentId}`);
    }
  }, [localArtifact?.status, localArtifact?.isVisible]);

  const artifact = useMemo(() => {
    if (!localArtifact) return initialArtifactData;
    return localArtifact;
  }, [localArtifact]);

  const setArtifact = useCallback(
    (updaterFn: UIArtifact | ((currentArtifact: UIArtifact) => UIArtifact)) => {
      setLocalArtifact((currentArtifact) => {
        const artifactToUpdate = currentArtifact || initialArtifactData;

        let newArtifact;
        if (typeof updaterFn === 'function') {
          newArtifact = updaterFn(artifactToUpdate);
        } else {
          newArtifact = updaterFn;
        }

        // Force a re-render when visibility changes
        if (artifactToUpdate.isVisible !== newArtifact.isVisible) {
          // Small delay to ensure state is updated before any animations complete
          setTimeout(() => {
            setLocalArtifact(newArtifact);
          }, 50);
        }

        return newArtifact;
      }, { revalidate: true });  // Force revalidation to ensure subscribers are notified
    },
    [setLocalArtifact],
  );

  const { data: localArtifactMetadata, mutate: setLocalArtifactMetadata } =
    useSWR<any>(
      () =>
        artifact.documentId ? `artifact-metadata-${artifact.documentId}` : null,
      null,
      {
        fallbackData: null,
      },
    );

  return useMemo(
    () => ({
      artifact,
      setArtifact,
      metadata: localArtifactMetadata,
      setMetadata: setLocalArtifactMetadata,
    }),
    [artifact, setArtifact, localArtifactMetadata, setLocalArtifactMetadata],
  );
}
