'use client';

import { useState, useEffect } from 'react';
import { SpreadsheetEditor } from './sheet-editor';
import { unparse } from 'papaparse';
import { useArtifact } from '@/hooks/use-artifact';

interface TemplateSheetViewProps {
  templateData: Record<string, any>; // the JSON structure of the assumptions template
  onUpdate?: (data: string) => void;
  chatId: string; // Add chatId prop
}

// Separate client component to handle artifact state
function TemplateSheetContent({ templateData, onUpdate, chatId }: TemplateSheetViewProps) {
  const { setArtifact, artifact } = useArtifact();
  const [isExpanded, setIsExpanded] = useState(false);

  // Convert the JSON structure to CSV format
  const convertJsonToCsv = (json: Record<string, any>) => {
    if (!json) return '';
    const rows = Object.entries(json).map(([key, value]) => {
      return [key, value?.toString() || ''];
    });
    return unparse(rows);
  };

  const csvData = convertJsonToCsv(templateData);

  // Set artifact state only when data changes or visibility changes
  useEffect(() => {
    if (templateData && csvData) {
      setArtifact({
        kind: 'sheet',
        title: 'Financial Assumptions',
        content: csvData,
        isVisible: isExpanded,
        status: 'idle',
        documentId: chatId,
        boundingBox: {
          top: 0,
          left: 0,
          width: 0,
          height: 0
        }
      });
    }
  }, [chatId, csvData, setArtifact, isExpanded, templateData]);

  const handleExpandClick = () => {
    setIsExpanded(true);
  };

  return (
    <div 
      className="w-full border border-gray-200 dark:border-gray-800 rounded-lg cursor-pointer"
      style={{ height: isExpanded ? '80vh' : '400px' }}
      onClick={!isExpanded ? handleExpandClick : undefined}
    >
      <h2 className="text-lg font-semibold p-4 border-b border-gray-200 dark:border-gray-800">
        Financial Assumptions {!isExpanded && <span className="text-sm text-gray-500">(Click to expand)</span>}
      </h2>
      <div className="h-[calc(100%-4rem)]">
        <SpreadsheetEditor 
          content={csvData}
          saveContent={(content, isCurrentVersion) => {
            if (onUpdate && isCurrentVersion) {
              onUpdate(content);
            }
          }}
          status="idle"
          isCurrentVersion={true}
          currentVersionIndex={0}
        />
      </div>
    </div>
  );
}

// Main component that ensures client-side only rendering
export function TemplateSheetView(props: TemplateSheetViewProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !props.templateData) {
    return (
      <div className="w-full h-[400px] border border-gray-200 dark:border-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold p-4 border-b border-gray-200 dark:border-gray-800">
          Loading Assumptions Template...
        </h2>
      </div>
    );
  }

  return <TemplateSheetContent {...props} />;
} 