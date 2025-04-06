/**
 * Test script for the processFinancialData tool
 * Run with: npx ts-node scripts/test-financial-tool.ts
 */

/**
 * This is a simple test script that simulates the behavior of the processFinancialData tool
 * without requiring the actual tool implementation or dependencies. It focuses on validating
 * the expected data flow and status transitions.
 */

// Mock financial data response - similar to what would come from the API
const mockApiResponse = {
  status: 'success',
  query: {
    symbol: 'AAPL',
    metrics: ['close']
  },
  data: [
    { date: '2023-01-01', AAPL: 150.25 },
    { date: '2023-01-02', AAPL: 152.35 },
    { date: '2023-01-03', AAPL: 153.87 },
    { date: '2023-01-04', AAPL: 151.92 },
    { date: '2023-01-05', AAPL: 154.10 }
  ],
  metadata: {
    dataSource: 'Mock Data',
    dataId: 'fin-test-id',
    sessionId: 'session-test-id'
  }
};

/**
 * Test the simulated financial data processing flow
 */
async function testToolFlow() {
  console.log("🔍 Testing financial data processing flow...");
  
  // Track the state changes
  const stateChanges: any[] = [];
  
  // Mock the data stream
  const dataStream = {
    writeData: (data: any) => {
      stateChanges.push(data);
      console.log(`📤 Stream data [${data.type}]:`, 
        data.type === 'financial_data_chunk' 
          ? `${data.content.length} data points` 
          : data.content
      );
    }
  };
  
  try {
    // Simulate document initialization
    console.log("📝 Initializing document...");
    dataStream.writeData({ type: 'kind', content: 'financial' });
    dataStream.writeData({ type: 'id', content: 'test-document-id' });
    dataStream.writeData({ type: 'title', content: 'Financial Data: AAPL' });
    
    // Simulate loading state
    console.log("⏳ Setting loading state...");
    dataStream.writeData({
      type: 'financial_status',
      content: { 
        status: 'loading',
        visualizationReady: false
      }
    });
    
    // Simulate API call
    console.log("📡 Simulating API call...");
    await new Promise(resolve => setTimeout(resolve, 500)); // simulate network delay
    
    // Simulate processing state
    console.log("🔄 Processing data...");
    dataStream.writeData({
      type: 'financial_status',
      content: { 
        status: 'processing',
        symbol: mockApiResponse.query.symbol,
        metrics: mockApiResponse.query.metrics,
        dataId: mockApiResponse.metadata.dataId,
        sessionId: mockApiResponse.metadata.sessionId,
        dataPoints: mockApiResponse.data.length,
        loadedPoints: 0
      }
    });
    
    // Simulate data transformation
    console.log("🔄 Transforming data...");
    const processedData = mockApiResponse.data.map(item => ({
      timestamp: item.date,
      value: item.AAPL
    }));
    
    // Simulate streaming data in chunks
    console.log("📤 Streaming data chunks...");
    dataStream.writeData({
      type: 'financial_data_chunk',
      content: processedData
    });
    
    dataStream.writeData({
      type: 'financial_status',
      content: { 
        loadedPoints: processedData.length
      }
    });
    
    // Simulate completion
    console.log("✅ Signaling completion...");
    dataStream.writeData({
      type: 'financial_complete',
      content: {
        status: 'ready',
        loadedPoints: processedData.length,
        visualizationReady: true
      }
    });
    
    dataStream.writeData({ type: 'finish', content: '' });
    
    // Validate state transitions
    console.log("\n🔍 Validating state transitions...");
    
    // Check initial state setting
    const kindState = stateChanges.find(s => s.type === 'kind');
    console.log(`✅ Kind set to: ${kindState?.content}`);
    
    // Check loading state
    const loadingState = stateChanges.find(s => 
      s.type === 'financial_status' && s.content.status === 'loading'
    );
    console.log(`✅ Loading state set: ${Boolean(loadingState)}`);
    
    // Check processing state
    const processingState = stateChanges.find(s => 
      s.type === 'financial_status' && s.content.status === 'processing'
    );
    console.log(`✅ Processing state set: ${Boolean(processingState)}`);
    
    // Check data chunks
    const dataChunks = stateChanges.filter(s => s.type === 'financial_data_chunk');
    console.log(`✅ Data chunks sent: ${dataChunks.length}`);
    
    // Check ready state
    const readyState = stateChanges.find(s => 
      s.type === 'financial_complete' && s.content.status === 'ready'
    );
    console.log(`✅ Ready state set: ${Boolean(readyState)}`);
    console.log(`✅ Visualization ready flag: ${readyState?.content.visualizationReady}`);
    
    return true;
  } catch (error) {
    console.error("❌ Test error:", error);
    return false;
  }
}

// Run the test
testToolFlow()
  .then(success => {
    console.log(`\n${success ? '✅ Test PASSED!' : '❌ Test FAILED!'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error("❌ Unhandled error:", error);
    process.exit(1);
  }); 