/**
 * Test script for verifying the complete financial tool integration
 * Run with: npx ts-node scripts/test-financial-integration.ts
 */
const fs_mod = require('fs');
const path_mod = require('path');

/**
 * Verify each component of the financial tool integration is properly set up
 */
function testFinancialIntegration() {
  console.log("🔍 Testing financial tool integration...");
  let allPassed = true;
  
  // Test 1: Verify the financial tool implementation
  console.log("\n1️⃣ Checking financial tool implementation...");
  const toolPath = path_mod.join(__dirname, '..', 'lib', 'ai', 'tools', 'process-financial-data.ts');
  const toolExists = fs_mod.existsSync(toolPath);
  console.log(`✅ Financial tool file exists: ${toolExists}`);
  allPassed = allPassed && toolExists;
  
  if (toolExists) {
    const toolContent = fs_mod.readFileSync(toolPath, 'utf8');
    console.log(`✅ Tool handles streaming: ${toolContent.includes('dataStream.writeData')}`);
    console.log(`✅ Tool processes API response: ${toolContent.includes('apiResponse')}`);
    console.log(`✅ Tool transforms data: ${toolContent.includes('processedData')}`);
  }
  
  // Test 2: Verify financial artifact implementation
  console.log("\n2️⃣ Checking financial artifact implementation...");
  
  // Server component
  const serverPath = path_mod.join(__dirname, '..', 'artifacts', 'financial', 'server.ts');
  const serverExists = fs_mod.existsSync(serverPath);
  console.log(`✅ Financial server artifact exists: ${serverExists}`);
  allPassed = allPassed && serverExists;
  
  // Client component
  const clientPath = path_mod.join(__dirname, '..', 'artifacts', 'financial', 'client.tsx');
  const clientExists = fs_mod.existsSync(clientPath);
  console.log(`✅ Financial client artifact exists: ${clientExists}`);
  allPassed = allPassed && clientExists;
  
  // Test 3: Verify artifact registration
  console.log("\n3️⃣ Checking artifact registration...");
  const registryPath = path_mod.join(__dirname, '..', 'lib', 'artifacts', 'registry.ts');
  const serverTsPath = path_mod.join(__dirname, '..', 'lib', 'artifacts', 'server.ts');
  
  if (fs_mod.existsSync(registryPath) && fs_mod.existsSync(serverTsPath)) {
    const registryContent = fs_mod.readFileSync(registryPath, 'utf8');
    const serverTsContent = fs_mod.readFileSync(serverTsPath, 'utf8');
    
    console.log(`✅ Registry imports financial handler: ${registryContent.includes('financialDocumentHandler')}`);
    console.log(`✅ Registry includes financial handler: ${registryContent.includes('financialDocumentHandler')}`);
    console.log(`✅ Artifact kinds includes financial: ${serverTsContent.includes("'financial'")}`);
    
    allPassed = allPassed && 
      registryContent.includes('financialDocumentHandler') && 
      serverTsContent.includes("'financial'");
  } else {
    console.log("❌ Registry or server.ts file missing");
    allPassed = false;
  }
  
  // Test 4: Verify API integration
  console.log("\n4️⃣ Checking API integration...");
  const chatRoutePath = path_mod.join(__dirname, '..', 'app', '(chat)', 'api', 'chat', 'route.ts');
  
  if (fs_mod.existsSync(chatRoutePath)) {
    const chatRouteContent = fs_mod.readFileSync(chatRoutePath, 'utf8');
    
    console.log(`✅ Chat route imports financial tool: ${chatRouteContent.includes('import { processFinancialData }')}`);
    console.log(`✅ Chat route registers financial tool: ${chatRouteContent.includes("'processFinancialData'")}`);
    console.log(`✅ Chat route uses financial tool: ${chatRouteContent.includes('processFinancialData:')}`);
    
    allPassed = allPassed && 
      chatRouteContent.includes('import { processFinancialData }') && 
      chatRouteContent.includes("'processFinancialData'");
  } else {
    console.log("❌ Chat route file missing");
    allPassed = false;
  }
  
  // Test 5: Verify prompt integration
  console.log("\n5️⃣ Checking prompt integration...");
  const promptsPath = path_mod.join(__dirname, '..', 'lib', 'ai', 'prompts.ts');
  
  if (fs_mod.existsSync(promptsPath)) {
    const promptsContent = fs_mod.readFileSync(promptsPath, 'utf8');
    
    console.log(`✅ Prompts file has financial data prompt: ${promptsContent.includes('export const financialDataPrompt')}`);
    console.log(`✅ System prompt includes financial data: ${promptsContent.includes('${financialDataPrompt}')}`);
    console.log(`✅ Financial data tool is mentioned: ${promptsContent.includes('processFinancialData')}`);
    
    allPassed = allPassed && 
      promptsContent.includes('export const financialDataPrompt') && 
      promptsContent.includes('${financialDataPrompt}');
  } else {
    console.log("❌ Prompts file missing");
    allPassed = false;
  }
  
  return allPassed;
}

// Run the test
try {
  const success = testFinancialIntegration();
  console.log(`\n${success ? '✅ Financial tool integration test PASSED!' : '❌ Test FAILED!'}`);
  console.log("\nYou can now ask the AI to visualize stock prices!");
  console.log("\nExample queries to try:");
  console.log("- Show me Apple stock price history");
  console.log("- What's the price trend for AMZN?");
  console.log("- Can you visualize MSFT stock data?");
  console.log("- Plot the stock price for Google");
  console.log("- How has Tesla stock performed?");
  
  process.exit(success ? 0 : 1);
} catch (error) {
  console.error("❌ Unhandled error:", error);
  process.exit(1);
} 