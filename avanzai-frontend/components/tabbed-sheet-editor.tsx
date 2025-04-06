'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SpreadsheetEditor } from './sheet-editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useSWR from 'swr';
import { fetcher } from '@/lib/utils';
import { unparse } from 'papaparse';
import { FullscreenIcon } from './icons';

interface DocumentMetadata {
  templateType: string;
  version: number;
  updatedAt: string;
  trigger?: {
    messageId: string;
    content: string;
  };
}

interface Document {
  id: string;
  chatId: string;
  title: string;
  content: string;
  kind: 'text' | 'code' | 'sheet' | 'image';
  createdAt: Date;
  userId: string;
  metadata: DocumentMetadata | null;
  role?: 'system' | 'user' | 'assistant';
}

interface TabbedSheetEditorProps {
  content: string;
  chatId: string;
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  status: string;
  saveContent: (content: string, debounce: boolean) => void;
}

const TAB_CONFIG = [
  { id: 'user_input', label: 'User Inputs' },
  { id: 'development', label: 'Development Costs' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'returns', label: 'Returns' },
  { id: 'cashflow', label: 'Cash Flow' }
] as const;

const convertTemplateToCSV = (template: any) => {
  if (!template) return '';

  console.log('Converting template to CSV:', JSON.stringify(template, null, 2));

  // Handle assumptions template (key-value with nested objects)
  if (!template.sections && !template.columns) {
    const rows: string[][] = [['Section', 'Subsection', 'Field', 'Value', 'Required']];
    
    // Helper function to process nested objects
    const processNestedObject = (
      sectionName: string,
      subsectionName: string,
      fieldName: string,
      data: any
    ) => {
      if (!data || typeof data !== 'object') return;

      // If the object has a value property, add it as a row
      if ('value' in data) {
        rows.push([
          sectionName,
          subsectionName,
          fieldName,
          data.value?.toString() || '',
          data.required?.toString() || 'false'
        ]);
        return;
      }

      // Skip description fields
      if (fieldName === 'description') return;

      // Recursively process nested objects
      Object.entries(data).forEach(([key, value]: [string, any]) => {
        if (key === 'description') return;
        if (typeof value === 'object') {
          processNestedObject(sectionName, fieldName, key, value);
        }
      });
    };
    
    // Process each main section
    Object.entries(template).forEach(([sectionName, sectionData]: [string, any]) => {
      if (!sectionData || typeof sectionData !== 'object') return;
      if (sectionName === 'description') return;

      // Process each field in the section
      Object.entries(sectionData).forEach(([fieldName, fieldData]: [string, any]) => {
        if (!fieldData || typeof fieldData !== 'object') return;
        if (fieldName === 'description') return;

        // If the field has a direct value property
        if ('value' in fieldData) {
          rows.push([
            sectionName,
            '',
            fieldName,
            fieldData.value?.toString() || '',
            fieldData.required?.toString() || 'false'
          ]);
        } else {
          // Process nested objects
          processNestedObject(sectionName, '', fieldName, fieldData);
        }
      });
      
      // Add separator between sections
      rows.push(['', '', '', '', '']);
    });
    
    console.log('Final rows for assumptions:', rows);
    return unparse(rows);
  }

  // Handle section-based templates (development, revenue, returns, cashflow)
  const rows: any[] = [];
  
  // Add title and metadata
  if (template.title) {
    rows.push([template.title]);
    rows.push([]);
  }
  
  if (template.metadata?.notes) {
    rows.push([template.metadata.notes]);
    rows.push([]);
  }

  // Add headers from columns definition
  if (template.columns) {
    const headers = template.columns.map((col: any) => col.name);
    console.log('Adding headers:', headers);
    rows.push(headers);
  }
  
  // Process each section
  if (template.sections) {
    template.sections.forEach((section: any) => {
      console.log('Processing section:', section.name, JSON.stringify(section, null, 2));
      rows.push([]); // Empty row before section
      rows.push([section.name, ...Array(template.columns?.length ? template.columns.length - 1 : 0).fill('')]);
      
      // Add rows
      if (section.rows) {
        section.rows.forEach((row: any) => {
          let rowData;
          if (Array.isArray(row)) {
            rowData = row;
          } else if (template.columns) {
            // Map object properties to columns
            rowData = template.columns.map((col: any) => {
              const value = row[col.name];
              console.log(`Processing column ${col.name}:`, value);
              return value !== undefined && value !== null ? value.toString() : '';
            });
          } else {
            rowData = Object.values(row).map(value => 
              value !== undefined && value !== null ? value.toString() : ''
            );
          }
          console.log('Adding row:', rowData);
          rows.push(rowData);
        });
      }
      
      // Add totals if present
      if (section.totals) {
        console.log('Processing totals:', section.totals);
        if (Array.isArray(section.totals)) {
          rows.push(section.totals);
        } else if (template.columns) {
          const totalsRow = template.columns.map((col: any) => {
            const value = section.totals[col.name];
            return value !== undefined && value !== null ? value.toString() : '';
          });
          rows.push(totalsRow);
        } else {
          rows.push(Object.values(section.totals).map(value => 
            value !== undefined && value !== null ? value.toString() : ''
          ));
        }
      }
    });
  }
  
  // Add metrics if present
  if (template.metrics) {
    console.log('Adding metrics:', template.metrics);
    rows.push([]);
    rows.push(['Metrics']);
    Object.entries(template.metrics).forEach(([key, value]) => {
      rows.push([key, value !== undefined && value !== null ? value.toString() : '']);
    });
  }

  console.log('Final rows:', rows);
  return unparse(rows);
};

// Define template types
type Template = {
  sections?: Array<{
    name: string;
    headers?: string[];
    rows?: any[][];
    totals?: Record<string, any>;
  }>;
  columns?: Array<{ name: string }>;
  updatedAt?: string; // Add timestamp for tracking most recent template
} | Record<string, any>;

type Templates = Record<string, Template>;

export function TabbedSheetEditor({
  content,
  chatId,
  isCurrentVersion,
  currentVersionIndex,
  status,
  saveContent
}: TabbedSheetEditorProps) {
  // Always fetch documents if we have a chatId
  const { data: documents = [], mutate: refreshDocuments } = useSWR(
    chatId ? `/api/documents?chatId=${chatId}` : null,
    fetcher
  );

  // Track previous document count to detect new templates
  const [prevDocCount, setPrevDocCount] = useState(0);

  // Group documents by template type, keeping only latest version
  const templateDocuments = useMemo(() => {
    return documents.reduce((acc: Record<string, Document>, doc: Document) => {
      const templateType = doc.metadata?.templateType;
      if (!templateType) return acc;

      const existingDoc = acc[templateType];
      const currentVersion = doc.metadata?.version || 0;
      const existingVersion = existingDoc?.metadata?.version || 0;

      if (!existingDoc || currentVersion > existingVersion) {
        acc[templateType] = doc;
      }
      return acc;
    }, {});
  }, [documents]);

  // Get available tabs from documents and sort by updatedAt timestamp
  const availableTabs = useMemo(() => {
    // First filter tabs that have documents with content
    const tabs = TAB_CONFIG.filter(tab => {
      // Special case for user_input - always include it
      if (tab.id === 'user_input') return true;
      
      // For other tabs, check if they have content
      const doc = templateDocuments[tab.id];
      return doc?.content && doc.kind === 'sheet';
    });

    // Sort tabs by updatedAt timestamp (most recent first)
    return tabs.sort((a, b) => {
      if (a.id === 'user_input') return -1; // Always keep user_input first
      if (b.id === 'user_input') return 1;
      
      const aDoc = templateDocuments[a.id];
      const bDoc = templateDocuments[b.id];
      const aTime = aDoc?.metadata?.updatedAt ? new Date(aDoc.metadata.updatedAt).getTime() : 0;
      const bTime = bDoc?.metadata?.updatedAt ? new Date(bDoc.metadata.updatedAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [templateDocuments]);

  // Set active tab to the most recently updated tab
  const [activeTab, setActiveTab] = useState<string | null>(() => {
    // If user_input is available, always use it as default
    if (availableTabs.some(tab => tab.id === 'user_input')) {
      return 'user_input';
    }
    // Otherwise use the first available tab
    return availableTabs[0]?.id || null;
  });

  // Effect to handle document updates and refresh
  useEffect(() => {
    const currentDocCount = Object.keys(templateDocuments).length;
    
    console.log('[DEBUG-BROWSER] TabbedSheetEditor status:', status, 
      'currentDocCount:', currentDocCount, 
      'prevDocCount:', prevDocCount);
    
    // If we have new documents or status changes from streaming to idle
    if (currentDocCount !== prevDocCount || (status === 'idle' && prevDocCount > 0)) {
      console.log('[DEBUG-BROWSER] TabbedSheetEditor refreshing documents');
      // Refresh the documents data
      refreshDocuments();
      
      // Update the active tab if we don't have one
      if (!activeTab && availableTabs.length > 0) {
        setActiveTab(availableTabs[0].id);
      }
      
      // Update the document count
      setPrevDocCount(currentDocCount);
    }
  }, [templateDocuments, status, activeTab, availableTabs, prevDocCount, refreshDocuments]);

  // If no chatId, show basic editor
  if (!chatId) {
    return (
      <div className="relative">
        <SpreadsheetEditor
          content={content}
          isCurrentVersion={isCurrentVersion}
          currentVersionIndex={currentVersionIndex}
          status={status}
          saveContent={saveContent}
        />
      </div>
    );
  }

  // Get content for active tab
  const activeDocument = activeTab ? templateDocuments[activeTab] : null;
  
  // Create default content for user_input tab if it doesn't exist
  const getDisplayContent = () => {
    if (activeTab === 'user_input' && !activeDocument?.content) {
      // Return a default CSV structure for user inputs
      return unparse([
        ['Section', 'Subsection', 'Field', 'Value'],
        ['Click here', '', 'to add', 'user inputs']
      ]);
    }
    return activeDocument?.content || content;
  };

  return (
    <Tabs
      value={activeTab || ''}
      onValueChange={setActiveTab}
      className="size-full"
    >
      <TabsList>
        {availableTabs.map((tab) => {
          const doc = templateDocuments[tab.id];
          const version = doc?.metadata?.version;
          const isUpdating = status === 'streaming' && doc?.metadata?.updatedAt;
          
          return (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className={isUpdating ? 'animate-pulse' : ''}
            >
              {tab.label}
              {version && version > 1 ? ` (v${version})` : ''}
            </TabsTrigger>
          );
        })}
      </TabsList>
      <TabsContent value={activeTab || 'initial'} className="h-full">
        <SpreadsheetEditor 
          content={getDisplayContent()}
          isCurrentVersion={isCurrentVersion}
          currentVersionIndex={currentVersionIndex}
          status={status}
          saveContent={saveContent}
        />
      </TabsContent>
    </Tabs>
  );
} 