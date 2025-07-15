# ICN Web UI

A modern React-based web interface for the InterCooperative Network (ICN), providing comprehensive management capabilities for federations, cooperatives, and communities.

## 🚀 Status: Ready for Development

✅ **Environment Fixed**: Successfully migrated to Node.js 18 LTS  
✅ **Dependencies Installed**: All packages working correctly  
✅ **Development Server**: Running on http://localhost:3000  
✅ **Core Features**: Dashboard, Jobs management, and UI components implemented  

## 🛠 Technology Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 4.5.14
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Node.js**: 18.20.8 LTS (required)

## 📦 Installation

### Prerequisites

- **Node.js 18 LTS** (required - the project includes `.nvmrc` for automatic version management)
- npm or yarn package manager

### Quick Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd icn-web-ui
   ```

2. **Run the automated setup script**:
   ```bash
   ./setup-dev.sh
   ```
   
   This script will:
   - Install and configure Node.js 18 LTS using nvm
   - Clean and reinstall dependencies
   - Create environment configuration
   - Test the development server

3. **Start development**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to http://localhost:3000

### Manual Setup

If you prefer manual setup:

1. **Ensure Node.js 18 LTS**:
   ```bash
   # Using nvm (recommended)
   nvm install 18.20.8
   nvm use 18.20.8
   
   # Or install directly from nodejs.org
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your ICN API endpoint
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, Input, etc.)
│   └── layout/         # Layout components
├── pages/              # Page components
│   ├── DashboardPage.tsx
│   ├── JobsPage.tsx
│   └── ...
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── api/                # API client and services
└── styles/             # Global styles and Tailwind config
```

### Key Features Implemented

#### 🏠 Dashboard
- Network overview and statistics
- Recent activity feed
- Quick action buttons
- Responsive design with Tailwind CSS

#### 📋 Jobs Management
- Complete job lifecycle management
- Job submission with validation
- Real-time status updates
- Filtering and search capabilities
- Detailed job information modals

#### 🎨 UI Components
- **Button**: Multiple variants (primary, secondary, outline, ghost)
- **Card**: Flexible container with header, content, and footer
- **Input**: Form inputs with validation states
- **Modal**: Reusable modal dialogs
- **Utility Classes**: Tailwind CSS utility functions

#### 🔌 API Integration
- Type-safe API client using Axios
- React Query for server state management
- Error handling and loading states
- Automatic request/response typing

## 🌐 Environment Configuration

The application uses environment variables for configuration:

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=ICN Web UI
VITE_APP_VERSION=0.1.0
```

## 🐛 Troubleshooting

### Common Issues

1. **Node.js Version Issues**:
   ```bash
   # Check your Node.js version
   node --version
   
   # Should be 18.x.x. If not, use the setup script:
   ./setup-dev.sh
   ```

2. **Port Already in Use**:
   ```bash
   # Kill existing processes on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

3. **Dependencies Issues**:
   ```bash
   # Clean and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Vite Issues**:
   ```bash
   # Clear Vite cache
   rm -rf node_modules/.vite
   npm run dev
   ```

### Development Server Issues

If you encounter segmentation faults or crashes:
1. Ensure you're using Node.js 18 LTS
2. Run the setup script: `./setup-dev.sh`
3. Check for conflicting processes
4. Clear all caches and reinstall dependencies

## 📚 API Integration

The UI integrates with the ICN Core API through the `icnApi.ts` client:

- **Jobs API**: Submit, list, and manage mesh jobs
- **Economics API**: Mana balance and transaction history
- **Governance API**: Proposals and voting
- **Identity API**: DID management and credentials

All API calls are typed and include proper error handling.

## 🎯 Next Steps

The application is feature-complete for core functionality. Next development priorities:

1. **Additional Pages**:
   - Governance/Proposals page
   - Economics/Mana management
   - Identity/DID management
   - Network/Peers page

2. **Enhanced Features**:
   - Real-time updates via WebSocket
   - Advanced filtering and search
   - Export functionality
   - User preferences and settings

3. **Production Readiness**:
   - Comprehensive testing
   - Performance optimization
   - Security hardening
   - Deployment configuration

## 🤝 Contributing

1. Ensure you're using Node.js 18 LTS
2. Follow the existing code style and patterns
3. Add tests for new features
4. Update documentation as needed

## 📄 License

[Add your license information here]

---

**Ready to develop!** The environment is properly configured and all core features are implemented. Start with `npm run dev` to begin development.
