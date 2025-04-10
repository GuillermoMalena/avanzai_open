import { DatabaseIcon } from 'lucide-react';

export default function DataSourcesPage() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Header Section */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Data Sources</h2>
      </div>
      
      {/* Coming Soon Content */}
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="rounded-full bg-muted p-8 mb-8">
          <DatabaseIcon className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-semibold mb-4">Coming Soon</h3>
        <p className="text-muted-foreground max-w-md">
          Our Data Sources feature will allow you to connect and manage various financial data streams, 
          enabling powerful analysis and insights for your investment decisions.
        </p>
      </div>
    </div>
  );
} 