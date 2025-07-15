#!/bin/bash

# ICN Web UI Development Environment Setup Script
# This script sets up the development environment for the ICN Web UI

set -e

echo "🚀 Setting up ICN Web UI development environment..."

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

# Check Node.js version and nvm
print_status "Checking Node.js environment..."

# Source nvm if available
if [ -f "$HOME/.nvm/nvm.sh" ]; then
    source "$HOME/.nvm/nvm.sh"
    print_success "nvm found and loaded"
else
    print_warning "nvm not found. Please install nvm first:"
    echo "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    exit 1
fi

# Check current Node.js version
CURRENT_NODE_VERSION=$(node --version 2>/dev/null || echo "none")
print_status "Current Node.js version: $CURRENT_NODE_VERSION"

# Check if .nvmrc exists and use it
if [ -f ".nvmrc" ]; then
    REQUIRED_VERSION=$(cat .nvmrc)
    print_status "Required Node.js version: $REQUIRED_VERSION"
    
    # Install and use the required version
    if ! nvm list | grep -q "$REQUIRED_VERSION"; then
        print_status "Installing Node.js $REQUIRED_VERSION..."
        nvm install "$REQUIRED_VERSION"
    fi
    
    print_status "Switching to Node.js $REQUIRED_VERSION..."
    nvm use "$REQUIRED_VERSION"
    
    # Set as default for this project
    nvm alias default "$REQUIRED_VERSION"
    
    print_success "Node.js $REQUIRED_VERSION is now active"
else
    print_warning "No .nvmrc file found. Installing Node.js 18 LTS..."
    nvm install lts/hydrogen
    nvm use lts/hydrogen
    nvm alias default lts/hydrogen
    echo "18.20.8" > .nvmrc
    print_success "Node.js 18 LTS installed and .nvmrc created"
fi

# Verify Node.js version
FINAL_NODE_VERSION=$(node --version)
print_success "Active Node.js version: $FINAL_NODE_VERSION"

# Check npm version
NPM_VERSION=$(npm --version)
print_status "npm version: $NPM_VERSION"

# Clean existing installation
print_status "Cleaning existing installation..."
rm -rf node_modules package-lock.json

# Install dependencies
print_status "Installing dependencies..."
npm install

# Check for security vulnerabilities
print_status "Checking for security vulnerabilities..."
npm audit

# Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    print_status "Creating .env.local file..."
    cat > .env.local << EOF
# ICN Web UI Environment Configuration
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=ICN Web UI
VITE_APP_VERSION=0.1.0
EOF
    print_success "Created .env.local file"
else
    print_status ".env.local already exists"
fi

# Check if the development server can start
print_status "Testing development server..."
timeout 10s npm run dev > /dev/null 2>&1 &
DEV_PID=$!

# Wait a moment for the server to start
sleep 3

# Check if the server is running
if kill -0 $DEV_PID 2>/dev/null; then
    print_success "Development server started successfully"
    kill $DEV_PID 2>/dev/null || true
else
    print_error "Failed to start development server"
    exit 1
fi

print_success "🎉 Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the development server: npm run dev"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Make sure the ICN node is running on http://localhost:8080"
echo ""
echo "Useful commands:"
echo "  npm run dev     - Start development server"
echo "  npm run build   - Build for production"
echo "  npm run preview - Preview production build"
echo "  npm run lint    - Run ESLint"
echo "  npm run test    - Run tests" 