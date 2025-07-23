# Namada Explorer

A modern block explorer for the Namada blockchain with support for both indexer API and direct RPC queries.

https://namada.world/

## Features

- 📊 Block and transaction exploration
- 👥 Validator information and staking data
- 🔍 Account balance and transaction history
- ⚡ Static data loading with React Query
- 🌐 Direct RPC queries using Namada SDK
- 📱 Modern responsive UI with Chakra UI

## Install

```bash
npm install
```

## Configuration

Create a `.env.local` file in the project root with the following variables:

```env
# Existing indexer API base URL (for your current API calls)
VITE_INDEXER_API_BASE=http://localhost:3000

# Namada RPC URL (for direct chain queries via SDK)
VITE_RPC_URL=http://localhost:27657

# Optional: MASP Indexer URL (for shielded transactions)
VITE_MASP_INDEXER_URL=

# Chain ID (will be auto-detected if not provided)
VITE_CHAIN_ID=
```

### Environment Variables

- `VITE_INDEXER_API_BASE`: URL of your indexer API (existing functionality)
- `VITE_RPC_URL`: Direct RPC endpoint to a Namada node
- `VITE_MASP_INDEXER_URL`: Optional MASP indexer for shielded transaction support
- `VITE_CHAIN_ID`: Chain ID (automatically detected if not specified)

## RPC Functionality

This explorer now supports direct RPC queries to Namada nodes using the official Namada SDK. This allows you to:

- Query chain parameters and native token information
- Get real-time validator data
- Fetch account balances directly from the chain
- Access staking and delegation information
- Retrieve gas costs and other chain metadata

### Available RPC Hooks

```typescript
import {
  useRpcNativeToken,
  useRpcAllValidators,
  useRpcBalance,
  useRpcStakingTotals,
  useRpcGasCosts,
} from './queries/useRpcQuery';

// Get native token
const { data: nativeToken } = useRpcNativeToken();

// Get all validators
const { data: validators } = useRpcAllValidators();

// Get account balance
const { data: balance } = useRpcBalance(
  "tnam1q9...", // owner address
  ["tnam1qx..."], // token addresses
  "namada-mainnet.abc123" // chain ID
);
```

### Data Loading Strategy

All RPC queries are configured for **static data loading**:
- Data is fetched once on page load/refresh
- Results are cached indefinitely (`staleTime: Infinity`)
- No recurring background updates
- Perfect for explorer use cases where data freshness is controlled by user navigation

### Example Usage

```typescript
import { ChainInfo } from './components/ChainInfo';

// This component demonstrates RPC usage
function App() {
  return (
    <div>
      <ChainInfo />
      {/* Your other components */}
    </div>
  );
}
```

## Build

```bash
npm run build
```

## Development

```bash
npm run dev
```

## Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **UI Library**: Chakra UI v3
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v7
- **Blockchain Integration**: Namada SDK + Custom indexer API
- **Data Strategy**: Static loading with infinite caching
