#!/usr/bin/env node

/**
 * Simple API connection test for ICN Core
 * This script tests basic connectivity to the icn-core HTTP API
 */

const http = require('http');

const API_BASE = 'http://localhost:8080';

// Test endpoints
const endpoints = [
  { path: '/health', name: 'Health Check' },
  { path: '/info', name: 'Node Info' },
  { path: '/status', name: 'Node Status' },
  { path: '/mesh/jobs', name: 'Jobs List' },
  { path: '/network/peers', name: 'Network Peers' },
  { path: '/dag/root', name: 'DAG Root' },
];

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}${path}`;
    
    const req = http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: json,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers,
            error: 'Invalid JSON response'
          });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testEndpoints() {
  console.log('🔍 Testing ICN Core API connectivity...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name} (${endpoint.path})...`);
      
      const result = await makeRequest(endpoint.path);
      
      if (result.status >= 200 && result.status < 300) {
        console.log(`✅ ${endpoint.name}: OK (${result.status})`);
        if (result.data && typeof result.data === 'object') {
          console.log(`   Response keys: ${Object.keys(result.data).join(', ')}`);
        }
        passed++;
      } else {
        console.log(`❌ ${endpoint.name}: HTTP ${result.status}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
      failed++;
    }
    
    console.log('');
  }
  
  console.log('📊 Test Summary:');
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total: ${endpoints.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! ICN Core API is accessible.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Check if icn-core is running on port 8080.');
    process.exit(1);
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
ICN Core API Connection Test

Usage: node test-api-connection.js [options]

Options:
  --help, -h     Show this help message
  --url <url>    Test against a different URL (default: http://localhost:8080)

Examples:
  node test-api-connection.js
  node test-api-connection.js --url http://192.168.1.100:8080
`);
  process.exit(0);
}

// Check for custom URL
const urlIndex = process.argv.indexOf('--url');
if (urlIndex !== -1 && process.argv[urlIndex + 1]) {
  const customUrl = process.argv[urlIndex + 1];
  if (customUrl.startsWith('http://') || customUrl.startsWith('https://')) {
    API_BASE = customUrl;
    console.log(`Using custom API URL: ${API_BASE}`);
  } else {
    console.error('Invalid URL format. Use http:// or https://');
    process.exit(1);
  }
}

// Run the tests
testEndpoints().catch((error) => {
  console.error('Test runner error:', error.message);
  process.exit(1);
}); 