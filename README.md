# ICN Web UI

> **Federation/Cooperative/Community Management Dashboard for the InterCooperative Network**

The ICN Web UI is a modern React-based dashboard application that provides a comprehensive interface for managing and monitoring ICN (InterCooperative Network) federations, cooperatives, and communities.

## Features

- **🚀 Dashboard Overview**: Real-time network statistics, mana balance, and activity monitoring
- **💼 Mesh Job Management**: Submit, monitor, and manage computational jobs across the mesh network
- **🗳️ Governance Interface**: Participate in network governance through proposals and voting
- **👤 Account Management**: Monitor mana balance, reputation, and transaction history
- **🌐 Network Monitoring**: View connected peers, network status, and performance metrics
- **⚙️ Settings**: Configure preferences and application settings

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom ICN design system
- **State Management**: React Query for server state
- **Routing**: React Router
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn package manager
- ICN Node running locally or accessible remotely

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd icn-web-ui
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Development Commands

The project uses `just` command runner for common development tasks:

```bash
# Development server
just dev

# Build for production
just build

# Run tests
just test

# Type checking
just type-check

# Linting
just lint
just lint-fix

# Formatting
just format
just format-check

# Full validation
just validate
```

Or use npm scripts directly:

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run test        # Run tests
npm run lint        # Lint code
npm run format      # Format code
```

## Configuration

### API Endpoint

The application connects to the ICN Node API. By default, it expects the API to be available at:

```
http://localhost:8080/api/v1
```

You can configure this in the `src/services/icnApi.ts` file or through environment variables.

### Environment Variables

Create a `.env.local` file for local development:

```env
VITE_ICN_API_URL=http://localhost:8080/api/v1
VITE_ICN_NETWORK_NAME=development
```

## Project Structure

```
src/
├── components/          # Reusable UI components
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

### Key Files

- `src/types/icn.ts`: TypeScript definitions for ICN API types
- `src/services/icnApi.ts`: HTTP client for ICN Node API
- `src/layouts/MainLayout.tsx`: Main application layout with navigation
- `src/pages/`: Individual page components for each route

## API Integration

The application communicates with the ICN Node via RESTful APIs defined in the `icn-core` project. The API client (`icnApi`) provides methods for:

- **Account Management**: Mana balance, transactions, transfers
- **Job Management**: Submit, monitor, and cancel mesh jobs
- **Governance**: Proposals, voting, and governance participation
- **Network**: Peer discovery, network statistics, connectivity
- **Identity**: DID resolution and credential management

## Design System

The UI follows the ICN design system with:

- **Colors**: ICN brand colors and mana-themed gradients
- **Typography**: Inter font family for text, JetBrains Mono for code
- **Components**: Consistent styling with utility classes
- **Icons**: Lucide React icon library
- **Responsive**: Mobile-first responsive design

### Custom CSS Classes

```css
.icn-card              /* Standard card component */
.icn-button-primary    /* Primary action button */
.icn-button-secondary  /* Secondary action button */
.mana-gradient         /* Mana-themed gradient */
.status-indicator      /* Status badges */
```

## Testing

The project uses Vitest for testing:

```bash
npm run test           # Run tests
npm run test:ui        # Run tests with UI
npm run test:coverage  # Run tests with coverage
```

## Contributing

1. Follow the ICN Shared Contributor Rules
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

## Deployment

### Production Build

```bash
npm run build
```

The built files will be in the `dist/` directory and can be served by any static file server.

### Docker

_Docker configuration coming soon..._

## License

This project is part of the InterCooperative Network and follows the same licensing terms as the main ICN project.

## Related Projects

- [icn-core](../icn-core): Core ICN runtime and API
- [icn-docs](../icn-docs): ICN documentation
- [icn-node](../icn-node): ICN node implementation
- [icn-explorer](../icn-explorer): Network explorer
- [icn-wallet](../icn-wallet): DID wallet interface

## Support

For support and questions:

- Check the [ICN Documentation](../icn-docs)
- Open an issue in this repository
- Join the ICN community discussions
