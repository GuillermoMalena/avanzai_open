/**
 * Test script for financial API integration
 * Run with: npx ts-node scripts/test-financial-api.ts
 */
const path = require('path');
// @ts-ignore
const nodeFetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

// Mock environment variables
process.env.FINANCIAL_API_URL = 'http://localhost:8000';
process.env.FINANCIAL_API_TIMEOUT_MS = '10000';

// Mock AbortSignal.timeout for older Node versions
if (!AbortSignal.timeout) {
  AbortSignal.timeout = function(ms: number) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  };
}

async function fetchFinancialData(query: string, timeRange: string = '1y', sessionId?: string) {
  console.log(`📡 Fetching financial data for: ${query}, timeRange: ${timeRange}`);
  
  // Get API URL from environment variables or use default
  const apiUrl = process.env.FINANCIAL_API_URL || 'http://localhost:8000';
  const endpoint = `${apiUrl}/process_financial_data`;
  console.log(`🔗 Using API URL: ${endpoint}`);
  
  // Generate a session ID if none provided (required by backend)
  const session_id = sessionId || uuidv4();
  console.log(`🆔 Using session ID: ${session_id}`);
  
  try {
    // Set timeout from environment or use default (10 seconds)
    const timeoutMs = parseInt(process.env.FINANCIAL_API_TIMEOUT_MS || '10000');
    
    // Make the request
    const response = await nodeFetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        timeRange,
        session_id,
        metrics: ["close"]
      }),
      signal: AbortSignal.timeout(timeoutMs)
    });
    
    // Check for HTTP errors
    if (!response.ok) {
      console.error(`❌ API request failed: Status ${response.status}`);
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    // Parse response
    const result = await response.json();
    console.log(`✅ API response received: Status ${result.status}, data points: ${result.data?.length || 0}`);
    
    // Validate response structure
    if (result.status !== 'success') {
      console.error(`❌ API returned error status: ${result.status}`, result.error);
      throw new Error(result.error?.message || 'Unknown API error');
    }
    
    return result;
  } catch (error: any) {
    console.error(`❌ Error fetching financial data:`, error);
    
    // Handle timeout separately
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new Error(`API request timed out after ${parseInt(process.env.FINANCIAL_API_TIMEOUT_MS || '10000')}ms`);
    }
    
    // Re-throw the error
    throw error;
  }
}

async function testApi() {
  console.log("🔍 Testing financial API integration...");
  
  try {
    // Test with a known ticker
    const ticker = "AAPL";
    const timeRange = "1m";
    console.log(`🧪 Testing API with query: ${ticker}, timeRange: ${timeRange}`);
    
    // Call the API
    const response = await fetchFinancialData(ticker, timeRange);
    
    // Print response details
    console.log("✅ API Response Status:", response.status);
    console.log("🔑 Symbol returned:", response.query?.symbol);
    console.log("📊 Data points received:", response.data?.length || 0);
    
    // Show sample data points (first and last)
    if (response.data && response.data.length > 0) {
      console.log("📝 First data point:", response.data[0]);
      console.log("📝 Last data point:", response.data[response.data.length - 1]);
    }
    
    // Check expected data fields
    const dataValid = response.data && Array.isArray(response.data) && response.data.length > 0;
    console.log(`✅ Data validation: ${dataValid ? 'passed' : 'failed'}`);
    
    return response;
  } catch (error: any) {
    console.error("❌ API Test Error:", error);
    throw error;
  }
}

// Run the test
testApi()
  .then(result => {
    console.log("✅ API Test completed successfully");
  })
  .catch(error => {
    console.error("❌ API Test failed:", error.message);
    process.exit(1);
  }); 