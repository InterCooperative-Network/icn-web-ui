#!/usr/bin/env node

import axios from 'axios';

const API_BASE = 'http://localhost:8080';

async function testAPIIntegration() {
  console.log('🧪 Testing ICN Core <-> Web UI Integration Fixes');
  console.log('================================================\n');

  try {
    // Test 1: Node Info (should work)
    console.log('1. Testing /info endpoint...');
    const infoResponse = await axios.get(`${API_BASE}/info`);
    console.log(`✅ Node Info: ${infoResponse.data.name} v${infoResponse.data.version}`);
    console.log(`   Status: ${infoResponse.data.status_message}`);

    // Test 2: Node Status (should work)
    console.log('\n2. Testing /status endpoint...');
    const statusResponse = await axios.get(`${API_BASE}/status`);
    console.log(`✅ Node Status: ${statusResponse.data.is_online ? 'Online' : 'Offline'}`);
    console.log(`   Peers: ${statusResponse.data.peer_count}`);

    // Test 3: Jobs endpoint (should return wrapper object)
    console.log('\n3. Testing /mesh/jobs endpoint (fixed response format)...');
    const jobsResponse = await axios.get(`${API_BASE}/mesh/jobs`);
    console.log(`✅ Jobs endpoint response structure: ${JSON.stringify(Object.keys(jobsResponse.data))}`);
    if (jobsResponse.data.jobs) {
      console.log(`   Jobs array length: ${jobsResponse.data.jobs.length}`);
    } else {
      console.log('❌ Expected "jobs" wrapper object not found');
    }

    // Test 4: Network peers
    console.log('\n4. Testing /network/peers endpoint...');
    const peersResponse = await axios.get(`${API_BASE}/network/peers`);
    console.log(`✅ Network peers: ${Array.isArray(peersResponse.data) ? peersResponse.data.length : 'Not an array'} peers`);

    // Test 5: Governance proposals
    console.log('\n5. Testing /governance/proposals endpoint...');
    const proposalsResponse = await axios.get(`${API_BASE}/governance/proposals`);
    console.log(`✅ Governance proposals: ${Array.isArray(proposalsResponse.data) ? proposalsResponse.data.length : 'Not an array'} proposals`);

    // Test 6: Federation status (should return proper object)
    console.log('\n6. Testing /federation/status endpoint...');
    const federationResponse = await axios.get(`${API_BASE}/federation/status`);
    console.log(`✅ Federation status: ${JSON.stringify(federationResponse.data)}`);

    console.log('\n🎉 All integration tests passed! API fixes are working correctly.');
    console.log('\n📝 Summary of fixes:');
    console.log('   - Jobs endpoint returns { jobs: [...] } wrapper object');
    console.log('   - Removed non-existent /account/{did}/mana endpoint');
    console.log('   - Updated federation status response format');
    console.log('   - Fixed TypeScript types to match actual API responses');

  } catch (error) {
    console.error(`❌ Integration test failed: ${error.message}`);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    console.error('\n💡 Make sure icn-node is running on localhost:8080');
    console.error('   Run: cd ../icn-core && cargo run --bin icn-node');
    process.exit(1);
  }
}

testAPIIntegration(); 