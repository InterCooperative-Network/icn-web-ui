# ICN Web UI

> **Status: ✅ INTEGRATION SUCCESSFUL** - ICN Core compilation issues resolved and icn-node binary successfully built and integrated.

A modern React-based web interface for managing and monitoring the InterCooperative Network (ICN). This dashboard provides intuitive access to mesh job management, network monitoring, governance participation, and system administration.

## 🎉 Recent Success

**✅ Major Integration Milestone Achieved:**
- Successfully resolved all ICN Core compilation issues
- Fixed merge conflicts and missing dependencies  
- Built working `icn-node` binary using gcc linker
- Verified API endpoints are functional
- Integration scripts updated and tested

## Quick Start

### Prerequisites
- Node.js 18 LTS (use `nvm use` to switch automatically)
- A compiled `icn-node` binary (see Integration section)

### 1. Quick Integration Test
```bash
# Test that icn-core integration works
./test-integration-quick.sh
```

### 2. Development Environment
```bash
# Setup and start both icn-node and web UI
./dev-setup.sh
```

### 3. Web UI Only
```bash
npm install
npm run dev
```

## Integration with ICN Core

### Building ICN Node
The web UI requires a working `icn-node` binary. Due to linker issues with the default `lld`, use gcc:

```bash
cd ../icn-core
CARGO_BUILD_JOBS=1 cargo build --bin icn-node --profile dev --config "target.x86_64-unknown-linux-gnu.linker=\"gcc\""
```

### Known Issues & Workarounds
- **Linker crashes**: Use gcc instead of lld (handled by our scripts)
- **Rust compiler SIGSEGV**: Use single-threaded compilation (`CARGO_BUILD_JOBS=1`)
- **Memory pressure**: Debug builds are more stable than release builds
- **Minor runtime logging**: Node may show tracing subscriber warnings (non-critical)

## 🛠 Technology Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 4.5.14
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Node.js**: 18.20.8 LTS

## 📋 Prerequisites

- **Node.js 18 LTS** (managed via nvm)
- **Rust toolchain** (for building icn-core)
- **icn-core repository** (cloned in parent directory)

## 🚀 Quick Start

### 1. Setup Development Environment

```bash
# Run the development setup script
./dev-setup.sh
```

This script will:
- Verify Node.js 18 LTS is active
- Build the icn-node binary from icn-core
- Create configuration files
- Generate development scripts

### 2. Start Development Environment

```bash
# Start both icn-core and web UI
./start-dev.sh
```

This will start:
- **ICN Node**: http://localhost:8080
- **Web UI**: http://localhost:3000

### 3. Test Integration

```bash
# Test API connectivity
./test-api-connection.js

# Or test the full integration
./test-integration.sh
```

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   └── ui/             # Base components (Button, Card, Input)
├── pages/              # Page components
│   ├── DashboardPage.tsx    # Main dashboard with real-time data
│   ├── JobsPage.tsx         # Job management with submission
│   ├── GovernancePage.tsx   # Governance interface
│   ├── NetworkPage.tsx      # Network monitoring
│   └── SettingsPage.tsx     # Configuration
├── services/           # API and external services
│   └── icnApi.ts      # ICN Core API client
├── types/              # TypeScript type definitions
│   └── icn.ts         # ICN API types
├── utils/              # Utility functions
└── layouts/            # Layout components
```

## 🔌 API Integration

The web UI communicates with icn-core via HTTP API endpoints:

### Node Information
- `GET /info` - Node information and version
- `GET /status` - Node operational status
- `GET /health` - Health check

### Mesh Computing (Jobs)
- `POST /mesh/submit` - Submit new job
- `GET /mesh/jobs` - List all jobs
- `GET /mesh/jobs/{id}` - Get job details

### Governance
- `POST /governance/submit` - Submit proposal
- `GET /governance/proposals` - List proposals
- `GET /governance/proposal/{id}` - Get proposal
- `POST /governance/vote` - Vote on proposal

### Network
- `GET /network/peers` - List network peers
- `GET /network/local-peer-id` - Get local peer ID

### DAG Operations
- `POST /dag/put` - Store block
- `POST /dag/get` - Retrieve block
- `GET /dag/root` - Get root
- `GET /dag/status` - Get status

### Account Management
- `GET /account/{did}/mana` - Get mana balance
- `GET /reputation/{did}` - Get reputation score

## 🎯 Features

### Dashboard
- Real-time node status and health
- Job statistics and success rates
- Network peer count and connectivity
- Recent activity feed
- Auto-refreshing data every 10-30 seconds

### Job Management
- Submit new mesh computing jobs
- View job status and progress
- Filter and search jobs
- Detailed job information and results
- Resource requirement specification

### Governance (Planned)
- View and create proposals
- Vote on governance decisions
- Track proposal status and results

### Network Monitoring (Planned)
- Peer discovery and status
- Network topology visualization
- Connection health monitoring

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run unit tests
./test-api-connection.js # Test API connectivity
./test-integration.sh    # Test full integration

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier
```

### Environment Variables

Create a `.env` file for local development:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_NODE_ENV=development
```

### API Client Configuration

The API client (`src/services/icnApi.ts`) is configured to:
- Connect to icn-core on port 8080
- Handle authentication (Bearer tokens)
- Provide comprehensive error handling
- Support real-time data updates

## 🐛 Troubleshooting

### Common Issues

**icn-node not starting**
```bash
# Check if port 8080 is available
netstat -tlnp | grep 8080

# Verify Rust toolchain
rustc --version
cargo --version

# Rebuild icn-core
cd ../icn-core
cargo clean
cargo build --release --bin icn-node
```

**Web UI not connecting to API**
```bash
# Test API connectivity
./test-api-connection.js

# Check CORS settings in icn-core
# Verify icn-node is running on port 8080
```

**Node.js version issues**
```bash
# Switch to Node.js 18 LTS
source ~/.nvm/nvm.sh
nvm use lts/hydrogen
node --version  # Should show v18.x.x
```

### Debug Mode

Enable debug logging:

```bash
# Set debug environment variable
export DEBUG=icn-web-ui:*

# Start development server
npm run dev
```

## 📚 Documentation

- **Development Guide**: [DEVELOPMENT.md](./DEVELOPMENT.md)
- **API Reference**: See icn-core documentation
- **Architecture**: See ICN documentation repository

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Add JSDoc comments for public APIs

## 📄 License

This project is part of the InterCooperative Network (ICN) and is licensed under the same terms as the ICN project.

## 🔗 Related Projects

- **[icn-core](https://github.com/intercooperative/icn-core)** - Core ICN implementation
- **[icn-docs](https://github.com/intercooperative/icn-docs)** - Documentation
- **[icn-website](https://github.com/intercooperative/icn-website)** - Public website

---

**Ready to build the future of cooperative computing! 🚀**
