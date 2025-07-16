// Quick integration test for ICN Web UI
const https = require('http');

async function testIntegration() {
  console.log('🧪 Testing ICN Web UI Integration...\n');
  
  // Test 1: Web UI is accessible
  try {
    const response = await fetch('http://localhost:3002');
    console.log('✅ Web UI (port 3002): Accessible');
  } catch (error) {
    console.log('❌ Web UI: Not accessible');
    return;
  }
  
  // Test 2: ICN Node API is accessible
  try {
    const response = await fetch('http://localhost:7845/info');
    const data = await response.json();
    console.log('✅ ICN Node API (port 7845): Working');
    console.log(`   Node: ${data.name} v${data.version}`);
    console.log(`   DID: ${data.status_message.split(', ')[0].replace('Node DID: ', '')}`);
    console.log(`   Mana: ${data.status_message.split('Mana: ')[1]}`);
  } catch (error) {
    console.log('❌ ICN Node API: Not accessible');
    return;
  }
  
  // Test 3: Mesh jobs endpoint
  try {
    const response = await fetch('http://localhost:7845/mesh/jobs');
    const data = await response.json();
    console.log('✅ Mesh Jobs API: Working');
    console.log(`   Current jobs: ${data.jobs.length}`);
  } catch (error) {
    console.log('❌ Mesh Jobs API: Error');
  }
  
  console.log('\n🎉 Integration Test Complete!');
  console.log('\n📱 Access your ICN Web UI at: http://localhost:3002');
  console.log('🔧 ICN Node API available at: http://localhost:7845');
}

testIntegration().catch(console.error);
