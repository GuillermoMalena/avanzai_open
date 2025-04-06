import { memo } from 'react';
import { CrossIcon } from './icons';
import { Button } from './ui/button';
import { initialArtifactData, useArtifact } from '@/hooks/use-artifact';

function PureArtifactCloseButton() {
  const { artifact, setArtifact } = useArtifact();

  return (
    <Button
      variant="outline"
      className="h-fit p-2 dark:hover:bg-zinc-700"
      onClick={() => {
        console.log('[DEBUG-BROWSER] Close button clicked, current artifact:', 
          { status: artifact.status, isVisible: artifact.isVisible, documentId: artifact.documentId });
        
        setArtifact({
          ...initialArtifactData,
          isVisible: false,
          status: 'idle'
        });
        
        console.log('[DEBUG-BROWSER] Updated artifact visibility to false');
      }}
    >
      <CrossIcon size={18} />
    </Button>
  );
}

export const ArtifactCloseButton = memo(PureArtifactCloseButton, () => true);
