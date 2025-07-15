#!/bin/bash

# ICN Development Environment Setup
# This script sets up and runs both icn-core and icn-web-ui for development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "This script must be run from the icn-web-ui directory"
    exit 1
fi

# Check Node.js version
print_status "Checking Node.js version..."
source ~/.nvm/nvm.sh
NODE_VERSION=$(node --version)
if [[ "$NODE_VERSION" != v18* ]]; then
    print_warning "Node.js version $NODE_VERSION detected. Switching to Node.js 18 LTS..."
    nvm use lts/hydrogen
    NODE_VERSION=$(node --version)
fi
print_success "Using Node.js $NODE_VERSION"

# Check if icn-core is available
ICN_CORE_PATH="../icn-core"
if [ ! -d "$ICN_CORE_PATH" ]; then
    print_error "icn-core directory not found at $ICN_CORE_PATH"
    print_error "Please ensure icn-core is cloned in the same parent directory as icn-web-ui"
    exit 1
fi

# Build icn-core
print_status "Building icn-core..."
cd "$ICN_CORE_PATH"

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    print_error "Rust/Cargo not found. Please install Rust first."
    print_error "Visit https://rustup.rs/ for installation instructions."
    exit 1
fi

# Build the icn-node binary
print_status "Building icn-node binary..."
CARGO_BUILD_JOBS=1 cargo build --bin icn-node --profile dev --config "target.x86_64-unknown-linux-gnu.linker=\"gcc\""

# Check if build was successful
if [ ! -f "target/debug/icn-node" ]; then
    print_error "Failed to build icn-node binary"
    exit 1
fi

print_success "icn-node binary built successfully"

# Return to icn-web-ui directory
cd - > /dev/null

# Create a simple configuration for icn-node
print_status "Creating icn-node configuration..."
mkdir -p ~/.icn

cat > ~/.icn/node-config.toml << EOF
# ICN Node Configuration
[core]
node_name = "ICN Development Node"
enable_p2p = false

[http]
http_listen_addr = "127.0.0.1:8080"
enable_cors = true

[storage]
backend_type = "memory"

[mesh]
enable_mesh = true
max_concurrent_jobs = 10

[governance]
enable_governance = true

[identity]
enable_identity = true
EOF

print_success "Configuration created at ~/.icn/node-config.toml"

# Create a development startup script
cat > start-dev.sh << 'EOF'
#!/bin/bash

# Development startup script for ICN
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Starting ICN Development Environment...${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "${BLUE}Shutting down development environment...${NC}"
    kill $ICN_PID 2>/dev/null || true
    kill $WEB_PID 2>/dev/null || true
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start icn-node
echo -e "${GREEN}Starting icn-node on http://localhost:8080...${NC}"
../icn-core/target/debug/icn-node &
ICN_PID=$!

# Wait for icn-node to start
sleep 3

# Check if icn-node is running
if ! curl -s http://localhost:8080/health > /dev/null; then
    echo "Failed to start icn-node"
    exit 1
fi

echo -e "${GREEN}icn-node is running on http://localhost:8080${NC}"

# Start web UI
echo -e "${GREEN}Starting web UI on http://localhost:3000...${NC}"
source ~/.nvm/nvm.sh
npm run dev &
WEB_PID=$!

# Wait for web UI to start
sleep 5

echo -e "${GREEN}Development environment is ready!${NC}"
echo -e "${BLUE}ICN Node: http://localhost:8080${NC}"
echo -e "${BLUE}Web UI: http://localhost:3000${NC}"
echo -e "${BLUE}Press Ctrl+C to stop both services${NC}"

# Wait for either process to exit
wait
EOF

chmod +x start-dev.sh

print_success "Development startup script created: ./start-dev.sh"

# Create a test script
cat > test-integration.sh << 'EOF'
#!/bin/bash

# Test integration between icn-core and icn-web-ui
set -e

echo "Testing ICN integration..."

# Test icn-node health
echo "Testing icn-node health endpoint..."
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ icn-node is healthy"
else
    echo "❌ icn-node health check failed"
    exit 1
fi

# Test web UI
echo "Testing web UI..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Web UI is accessible"
else
    echo "❌ Web UI is not accessible"
    exit 1
fi

# Test API integration
echo "Testing API integration..."
NODE_INFO=$(curl -s http://localhost:8080/info)
if echo "$NODE_INFO" | grep -q "name"; then
    echo "✅ API integration working"
else
    echo "❌ API integration failed"
    exit 1
fi

echo "🎉 All integration tests passed!"
EOF

chmod +x test-integration.sh

print_success "Integration test script created: ./test-integration.sh"

# Create a README for development
cat > DEVELOPMENT.md << 'EOF'
# ICN Web UI Development Guide

## Quick Start

1. **Start the development environment:**
   ```bash
   ./start-dev.sh
   ```

2. **Test the integration:**
   ```bash
   ./test-integration.sh
   ```

## Services

- **ICN Node**: http://localhost:8080
  - Health: http://localhost:8080/health
  - Info: http://localhost:8080/info
  - Status: http://localhost:8080/status
  - Metrics: http://localhost:8080/metrics

- **Web UI**: http://localhost:3000
  - Dashboard: http://localhost:3000/
  - Jobs: http://localhost:3000/jobs
  - Governance: http://localhost:3000/governance
  - Network: http://localhost:3000/network

## API Endpoints

The web UI communicates with icn-core via these endpoints:

### Node Information
- `GET /info` - Node information
- `GET /status` - Node status
- `GET /health` - Health check

### Mesh (Jobs)
- `POST /mesh/submit` - Submit a job
- `GET /mesh/jobs` - List all jobs
- `GET /mesh/jobs/{id}` - Get job details

### Governance
- `POST /governance/submit` - Submit proposal
- `GET /governance/proposals` - List proposals
- `GET /governance/proposal/{id}` - Get proposal
- `POST /governance/vote` - Vote on proposal

### Network
- `GET /network/peers` - List peers
- `GET /network/local-peer-id` - Get local peer ID

### DAG
- `POST /dag/put` - Store block
- `POST /dag/get` - Retrieve block
- `GET /dag/root` - Get root
- `GET /dag/status` - Get status

### Account
- `GET /account/{did}/mana` - Get mana balance
- `GET /reputation/{did}` - Get reputation

## Troubleshooting

### icn-node not starting
- Check if port 8080 is available
- Verify Rust toolchain is installed
- Check ~/.icn/node-config.toml exists

### Web UI not connecting
- Ensure icn-node is running on port 8080
- Check browser console for CORS errors
- Verify API endpoints are accessible

### Build issues
- Run `cargo clean` in icn-core directory
- Run `npm clean-install` in icn-web-ui directory
- Check Node.js version (should be 18.x)
EOF

print_success "Development guide created: ./DEVELOPMENT.md"

print_success "Development environment setup complete!"
print_status "To start development:"
print_status "1. Run: ./start-dev.sh"
print_status "2. Open: http://localhost:3000"
print_status "3. Test: ./test-integration.sh" 