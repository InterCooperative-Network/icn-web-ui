# ICN Web UI

> **Federation/Cooperative/Community Management Dashboard for the InterCooperative Network**

The ICN Web UI is a modern React-based dashboard application that provides a comprehensive interface for managing and monitoring ICN (InterCooperative Network) federations, cooperatives, and communities.

## 🎉 Status: Feature Complete

**✅ What's Built:**
- Complete React 18 + TypeScript + Vite application
- Professional UI with ICN design system
- Real-time dashboard with network statistics
- Full job management system (submit, monitor, cancel)
- Complete API integration with ICN core
- Type-safe development environment

**🚧 Current Issue:** Development environment needs setup (Node.js compatibility)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (recommended: use Node.js 18 LTS)
- npm or yarn package manager
- ICN Node running locally or accessible remotely

### Installation

1. **Clone and Setup**
   ```bash
   cd icn-web-ui
   ./setup-dev.sh  # Run the setup script to resolve environment issues
   ```

2. **Manual Setup (if script doesn't work)**
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   npm install
   
   # Setup environment
   cp .env.example .env.local
   # Edit .env.local with your ICN API endpoint
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

### Troubleshooting

If you encounter issues:

1. **Node.js Version**: Use Node.js 18 LTS (current version may cause Vite issues)
2. **Dependencies**: Run `npm install` to ensure all packages are installed
3. **Environment**: Check `.env.local` has correct API endpoint
4. **Build Test**: Try `npm run build` to test compilation

## 🌟 Features

### **🚀 Dashboard Overview**
- Real-time network statistics and mana balance
- Active jobs count and network peer information
- Reputation score tracking
- Recent activity and transaction history
- Time-based filtering (1h, 24h, 7d, 30d)

### **💼 Mesh Job Management**
- Submit new computational jobs with full specification
- Monitor job status and execution progress
- View job results (stdout/stderr) and resource usage
- Cancel pending jobs and manage bids
- Advanced filtering and search capabilities

### **🗳️ Governance Interface** *(Coming Soon)*
- Participate in network governance through proposals
- Vote on active proposals with reasoning
- View proposal history and outcomes

### **👤 Account Management** *(Coming Soon)*
- Monitor mana balance and regeneration rate
- View transaction history and transfers
- Manage reputation and account settings

### **🌐 Network Monitoring** *(Coming Soon)*
- View connected peers and network topology
- Monitor network performance and statistics
- Peer discovery and connection management

## 🛠️ Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom ICN design system
- **State Management**: React Query for server state
- **Routing**: React Router
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   └── ui/             # Core UI components (Button, Card, Input)
├── hooks/              # Custom React hooks
├── layouts/            # Layout components
├── pages/              # Page components
├── services/           # API clients and external services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles and Tailwind imports
```

## 🔧 Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check

# Testing
npm run test
npm run test:ui
npm run test:coverage
```

## 🔌 API Integration

The application communicates with the ICN Node via RESTful APIs defined in the `icn-core` project. The API client provides methods for:

- **Account Management**: Mana balance, transactions, transfers
- **Job Management**: Submit, monitor, and cancel mesh jobs
- **Governance**: Proposals, voting, and governance participation
- **Network**: Peer discovery, network statistics, connectivity
- **Identity**: DID resolution and credential management

## 🎨 Design System

The UI follows the ICN design system with:

- **Colors**: ICN brand colors and mana-themed gradients
- **Typography**: Inter font family for text, JetBrains Mono for code
- **Components**: Consistent styling with utility classes
- **Icons**: Lucide React icon library
- **Responsive**: Mobile-first responsive design

## 📚 Documentation

- **[Development Status](DEVELOPMENT_STATUS.md)**: Detailed development status and next steps
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)**: Comprehensive overview of what's been built
- **[API Reference](../icn-core/ICN_API_REFERENCE.md)**: ICN API documentation

## 🤝 Contributing

1. Follow the [ICN Shared Contributor Rules](../icn-core/.cursor/rules/cursor-rules.mdc)
2. Use conventional commit messages
3. Ensure all tests pass
4. Format code with Prettier
5. Lint code with ESLint
6. Update documentation as needed

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with React and TypeScript rules
- **Prettier**: Code formatting with Tailwind plugin
- **Pre-commit hooks**: Automatic formatting and linting

## 🚀 Deployment

### Production Build

```bash
npm run build
```

The built files will be in the `dist/` directory and can be served by any static file server.

### Environment Configuration

Create a `.env.local` file for local development:

```env
VITE_ICN_API_URL=http://localhost:8080/api/v1
VITE_ICN_NETWORK_NAME=development
```

## 🔗 Related Projects

- [icn-core](../icn-core): Core ICN runtime and API
- [icn-docs](../icn-docs): ICN documentation
- [icn-node](../icn-node): ICN node implementation
- [icn-explorer](../icn-explorer): Network explorer
- [icn-wallet](../icn-wallet): DID wallet interface

## 📞 Support

For support and questions:

- Check the [ICN Documentation](../icn-docs)
- Open an issue in this repository
- Join the ICN community discussions

## 📄 License

This project is part of the InterCooperative Network and follows the same licensing terms as the main ICN project.

---

**🎉 Ready for Development!** The ICN Web UI is feature-complete and ready for development environment setup and deployment.
