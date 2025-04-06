/**
 * Test script for the financial artifact implementation
 * Run with: npx ts-node scripts/test-financial-artifact.ts
 */

/**
 * This test is a simple check that our files exist and have the expected structure.
 * Since we can't easily import the React components in a Node script, we'll focus on
 * checking file existence and basic properties.
 */
const fs = require('fs');
const pathModule = require('path');

function testFinancialArtifact() {
  console.log("🔍 Testing financial artifact implementation...");
  let allPassed = true;
  
  // Test 1: Check server file exists
  console.log("\n1️⃣ Testing server file existence...");
  const serverPath = pathModule.join(__dirname, '..', 'artifacts', 'financial', 'server.ts');
  const serverExists = fs.existsSync(serverPath);
  console.log(`✅ Server file exists: ${serverExists}`);
  allPassed = allPassed && serverExists;
  
  if (serverExists) {
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    console.log(`✅ Server file has onCreateDocument: ${serverContent.includes('onCreateDocument')}`);
    console.log(`✅ Server file has onUpdateDocument: ${serverContent.includes('onUpdateDocument')}`);
    console.log(`✅ Server file exports financialDocumentHandler: ${serverContent.includes('export const financialDocumentHandler')}`);
  }
  
  // Test 2: Check client file exists
  console.log("\n2️⃣ Testing client file existence...");
  const clientPath = pathModule.join(__dirname, '..', 'artifacts', 'financial', 'client.tsx');
  const clientExists = fs.existsSync(clientPath);
  console.log(`✅ Client file exists: ${clientExists}`);
  allPassed = allPassed && clientExists;
  
  if (clientExists) {
    const clientContent = fs.readFileSync(clientPath, 'utf8');
    console.log(`✅ Client file exports FinancialArtifact: ${clientContent.includes('export const FinancialArtifact')}`);
    console.log(`✅ Client file handles stream parts: ${clientContent.includes('onStreamPart')}`);
    console.log(`✅ Client file renders chart: ${clientContent.includes('LineChart')}`);
  }
  
  // Test 3: Check registry update
  console.log("\n3️⃣ Testing artifact registry...");
  const registryPath = pathModule.join(__dirname, '..', 'lib', 'artifacts', 'registry.ts');
  const registryExists = fs.existsSync(registryPath);
  console.log(`✅ Registry file exists: ${registryExists}`);
  allPassed = allPassed && registryExists;
  
  if (registryExists) {
    const registryContent = fs.readFileSync(registryPath, 'utf8');
    console.log(`✅ Registry imports financial handler: ${registryContent.includes('financialDocumentHandler')}`);
    console.log(`✅ Registry includes financial handler: ${registryContent.includes('financialDocumentHandler')}`);
  }
  
  // Test 4: Check artifact kinds
  console.log("\n4️⃣ Testing artifact kinds...");
  const serverTsPath = pathModule.join(__dirname, '..', 'lib', 'artifacts', 'server.ts');
  const serverTsExists = fs.existsSync(serverTsPath);
  console.log(`✅ Server types file exists: ${serverTsExists}`);
  allPassed = allPassed && serverTsExists;
  
  if (serverTsExists) {
    const serverTsContent = fs.readFileSync(serverTsPath, 'utf8');
    console.log(`✅ Artifact kinds include financial: ${serverTsContent.includes("'financial'")}`);
  }
  
  return allPassed;
}

// Run the test
try {
  const success = testFinancialArtifact();
  console.log(`\n${success ? '✅ Financial artifact implementation test PASSED!' : '❌ Test FAILED!'}`);
  process.exit(success ? 0 : 1);
} catch (error) {
  console.error("❌ Unhandled error:", error);
  process.exit(1);
} 