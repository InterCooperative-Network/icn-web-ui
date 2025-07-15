#!/bin/bash

# Quick Integration Test for ICN Core + Web UI
# Tests that the newly built icn-node binary can start and respond to API calls

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if icn-node binary exists
if [ ! -f "../icn-core/target/debug/icn-node" ]; then
    print_error "icn-node binary not found. Please run the build first:"
    echo "cd ../icn-core && CARGO_BUILD_JOBS=1 cargo build --bin icn-node --profile dev --config \"target.x86_64-unknown-linux-gnu.linker=\\\"gcc\\\"\""
    exit 1
fi

print_success "Found icn-node binary"

# Start icn-node in background
print_status "Starting icn-node..."

# Create a minimal config for testing
cat > /tmp/icn-test-config.toml << EOF
[network]
listen_address = "127.0.0.1:8080"

[identity]
did = "did:key:test123"

[storage]
dag_store_path = "/tmp/icn-test-dag"
mana_ledger_path = "/tmp/icn-test-mana.sqlite"
EOF

# Start the node
cd ../icn-core
RUST_LOG=warn ./target/debug/icn-node --config /tmp/icn-test-config.toml &
NODE_PID=$!

cd ../icn-web-ui

# Wait for node to start
print_status "Waiting for icn-node to start..."
sleep 5

# Test basic connectivity
print_status "Testing API connectivity..."

# Test health endpoint
if curl -s http://localhost:8080/health > /dev/null; then
    print_success "✓ Health endpoint responding"
else
    print_error "✗ Health endpoint not responding"
    kill $NODE_PID 2>/dev/null || true
    exit 1
fi

# Test node info endpoint
if curl -s http://localhost:8080/api/v1/node/info > /dev/null; then
    print_success "✓ Node info endpoint responding"
else
    print_error "✗ Node info endpoint not responding"
    kill $NODE_PID 2>/dev/null || true
    exit 1
fi

# Test jobs endpoint
if curl -s http://localhost:8080/api/v1/jobs > /dev/null; then
    print_success "✓ Jobs endpoint responding"
else
    print_error "✗ Jobs endpoint not responding"
    kill $NODE_PID 2>/dev/null || true
    exit 1
fi

print_success "🎉 All API endpoints are responding correctly!"

# Clean up
print_status "Shutting down icn-node..."
kill $NODE_PID 2>/dev/null || true
wait $NODE_PID 2>/dev/null || true

# Clean up test files
rm -f /tmp/icn-test-config.toml
rm -rf /tmp/icn-test-dag
rm -f /tmp/icn-test-mana.sqlite

print_success "Integration test completed successfully!"
print_status "You can now start the full development environment with: ./dev-setup.sh" 