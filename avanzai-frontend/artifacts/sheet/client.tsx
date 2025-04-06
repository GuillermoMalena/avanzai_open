import { Artifact } from '@/components/create-artifact';
import {
  CopyIcon,
  LineChartIcon,
  RedoIcon,
  SparklesIcon,
  UndoIcon,
} from '@/components/icons';
import { TabbedSheetEditor } from '@/components/tabbed-sheet-editor';
import { parse, unparse } from 'papaparse';
import { toast } from 'sonner';

type Metadata = {
  documentId: string;
  isInitialized: boolean;
  isPlaceholder: boolean;
  templateState?: {
    assumptions?: boolean;
    development_template?: boolean;
    revenue_template?: boolean;
    returns_template?: boolean;
    cashflow_template?: boolean;
  };
};

export const sheetArtifact = new Artifact<'sheet', Metadata>({
  kind: 'sheet',
  description: 'Useful for working with spreadsheets',
  initialize: async ({ documentId, setMetadata }) => {
    console.log('[DEBUG-SHEET] Initializing sheet artifact with documentId:', documentId);
    setMetadata({
      documentId,
      isInitialized: true,
      isPlaceholder: false
    });
  },
  onStreamPart: ({ streamPart, setMetadata, setArtifact }) => {
    console.log('[DEBUG-SHEET] Processing stream part:', {
      type: streamPart.type,
      content: streamPart.type === 'metadata' ? JSON.parse(streamPart.content as string) : streamPart.content
    });

    if (streamPart.type === 'sheet-delta') {
      console.log('[DEBUG-SHEET] Updating sheet content');
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.content as string,
        isVisible: true,
        status: 'streaming',
      }));
    }
    if (streamPart.type === 'metadata') {
      const metadata = JSON.parse(streamPart.content as string);
      console.log('[DEBUG-SHEET] Setting metadata:', metadata);
      
      setArtifact((draftArtifact) => {
        console.log('[DEBUG-SHEET] Current artifact state:', draftArtifact);
        const newState = {
          ...draftArtifact,
          metadata,
          status: 'streaming' as const,
        };
        console.log('[DEBUG-SHEET] New artifact state:', newState);
        return newState;
      });
      
      setMetadata(currentMetadata => {
        console.log('[DEBUG-SHEET] Current metadata state:', currentMetadata);
        const newMetadata = {
          ...currentMetadata,
          ...metadata
        };
        console.log('[DEBUG-SHEET] New metadata state:', newMetadata);
        return newMetadata;
      });
    }
  },
  content: ({
    content,
    currentVersionIndex,
    isCurrentVersion,
    onSaveContent,
    status,
    metadata
  }) => {
    return (
      <TabbedSheetEditor
        content={content}
        currentVersionIndex={currentVersionIndex}
        isCurrentVersion={isCurrentVersion}
        saveContent={onSaveContent}
        status={status}
        chatId={metadata?.documentId}
      />
    );
  },
  actions: [
    {
      icon: <UndoIcon size={18} />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('prev');
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <CopyIcon />,
      description: 'Copy as .csv',
      onClick: ({ content }) => {
        const parsed = parse<string[]>(content, { skipEmptyLines: true });

        const nonEmptyRows = parsed.data.filter((row) =>
          row.some((cell) => cell.trim() !== ''),
        );

        const cleanedCsv = unparse(nonEmptyRows);

        navigator.clipboard.writeText(cleanedCsv);
        toast.success('Copied csv to clipboard!');
      },
    },
  ],
  toolbar: [
    {
      description: 'Format and clean data',
      icon: <SparklesIcon />,
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Can you please format and clean the data?',
        });
      },
    },
    {
      description: 'Analyze and visualize data',
      icon: <LineChartIcon />,
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content:
            'Can you please analyze and visualize the data by creating a new code artifact in python?',
        });
      },
    },
  ],
});
