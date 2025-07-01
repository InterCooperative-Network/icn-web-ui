# ICN Web UI Development Commands

# Default recipe - show available commands
default:
    @just --list

# Install dependencies
install:
    npm ci

# Development server
dev:
    npm run dev

# Build for production
build:
    npm run build

# Preview production build
preview:
    npm run preview

# Run tests
test:
    npm run test

# Run tests with UI
test-ui:
    npm run test:ui

# Run tests with coverage
test-coverage:
    npm run test:coverage

# Lint code
lint:
    npm run lint

# Fix linting issues
lint-fix:
    npm run lint:fix

# Format code
format:
    npm run format

# Check formatting
format-check:
    npm run format:check

# Type check
type-check:
    npm run type-check

# Full validation (lint, format, type-check, test)
validate: lint format-check type-check test

# Clean build artifacts
clean:
    rm -rf dist
    rm -rf node_modules/.vite

# Setup project (install + initial setup)
setup: install
    @echo "ICN Web UI setup complete!"

# Health check
health:
    npm run type-check
    npm run lint
    @echo "✅ ICN Web UI health check passed"
