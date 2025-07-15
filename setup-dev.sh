#!/bin/bash

# ICN Web UI Development Setup Script
# This script helps resolve common development environment issues

set -e

echo "🚀 ICN Web UI Development Setup"
echo "================================"

# Check Node.js version
echo "📋 Checking Node.js version..."
NODE_VERSION=$(node --version)
echo "Current Node.js version: $NODE_VERSION"

# Extract major version
MAJOR_VERSION=$(echo $NODE_VERSION | sed 's/v\([0-9]*\)\..*/\1/')

if [ "$MAJOR_VERSION" -gt "18" ]; then
    echo "⚠️  Warning: You're using Node.js $NODE_VERSION"
    echo "   This may cause compatibility issues with Vite."
    echo "   Recommended: Use Node.js 18 LTS"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please install Node.js 18 LTS and try again."
        exit 1
    fi
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the icn-web-ui directory."
    exit 1
fi

# Clean installation
echo "🧹 Cleaning previous installation..."
rm -rf node_modules package-lock.json

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check for missing dependencies
echo "🔍 Checking for missing dependencies..."
MISSING_DEPS=()

# Check if key dependencies are installed
if [ ! -d "node_modules/react" ]; then
    MISSING_DEPS+=("react")
fi

if [ ! -d "node_modules/@tanstack/react-query" ]; then
    MISSING_DEPS+=("@tanstack/react-query")
fi

if [ ! -d "node_modules/lucide-react" ]; then
    MISSING_DEPS+=("lucide-react")
fi

if [ ! -d "node_modules/class-variance-authority" ]; then
    MISSING_DEPS+=("class-variance-authority")
fi

if [ ! -d "node_modules/clsx" ]; then
    MISSING_DEPS+=("clsx")
fi

if [ ! -d "node_modules/tailwind-merge" ]; then
    MISSING_DEPS+=("tailwind-merge")
fi

if [ ${#MISSING_DEPS[@]} -ne 0 ]; then
    echo "⚠️  Missing dependencies detected: ${MISSING_DEPS[*]}"
    echo "📦 Installing missing dependencies..."
    npm install "${MISSING_DEPS[@]}"
fi

# Setup environment file
echo "⚙️  Setting up environment..."
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "✅ Created .env.local from .env.example"
        echo "   Please edit .env.local with your ICN API endpoint"
    else
        echo "📝 Creating .env.local..."
        cat > .env.local << EOF
# ICN Web UI Environment Configuration
VITE_ICN_API_URL=http://localhost:8080/api/v1
VITE_ICN_NETWORK_NAME=development
EOF
        echo "✅ Created .env.local with default settings"
    fi
else
    echo "✅ .env.local already exists"
fi

# Check TypeScript configuration
echo "🔧 Checking TypeScript configuration..."
if [ ! -f "tsconfig.json" ]; then
    echo "❌ Error: tsconfig.json not found"
    exit 1
fi

# Try to run type check
echo "🔍 Running TypeScript check..."
if npm run type-check > /dev/null 2>&1; then
    echo "✅ TypeScript configuration is valid"
else
    echo "⚠️  TypeScript check failed - this may be due to missing React types"
    echo "   This is expected if React types aren't properly installed"
fi

# Test Vite build
echo "🔨 Testing Vite build..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Vite build successful"
else
    echo "⚠️  Vite build failed - this may be due to missing dependencies"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your ICN API endpoint"
echo "2. Start the development server: npm run dev"
echo "3. If you encounter issues, try:"
echo "   - Using Node.js 18 LTS"
echo "   - Running: npm run dev -- --host"
echo "   - Checking the browser console for errors"
echo ""
echo "For more help, see DEVELOPMENT_STATUS.md" 