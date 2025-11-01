# Fare Casino - Monorepo

A full-stack Solana-based casino platform with provably fair gaming powered by the Fare Protocol.

## 🏗️ Monorepo Structure

```
fare-casino/
├── apps/
│   ├── api/          # NestJS Backend API
│   └── web/          # React + Vite Frontend
└── packages/
    └── types/        # Shared TypeScript types
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL 14.x or higher
- Redis 7.x or higher
- npm 9.x or higher

### Installation

```bash
# Install all dependencies (workspaces)
npm install

# Build shared packages
cd packages/types && npm run build && cd ../..
```

### Development

#### Start Backend API

```bash
# Terminal 1: Start API (with hot reload)
npm run dev:api

# API will be available at http://localhost:8080
```

#### Start Frontend

```bash
# Terminal 2: Start Web (with hot reload)
npm run dev:web

# Frontend will be available at http://localhost:3000
```

#### Start Both Simultaneously

```bash
# Start both API and Web
npm run dev
```

## 📦 Apps

### Backend API (`apps/api`)

NestJS-based API server that:
- Processes Solana blockchain events from Fare Protocol
- Provides REST API for player stats, casino stats, and trials
- Handles WebSocket connections for real-time updates
- Manages event queues with BullMQ

**Tech Stack:**
- NestJS 10.x
- PostgreSQL + Prisma ORM
- Redis + BullMQ
- Socket.IO
- Solana Web3.js

**Key Features:**
- ✅ Blockchain event parsing
- ✅ 3-queue processing system
- ✅ REST API endpoints
- ✅ WebSocket real-time events
- ✅ Health checks

[View API Documentation](./apps/api/README.md)

### Frontend Web (`apps/web`)

React + Vite SPA that:
- Connects to Solana wallets
- Displays real-time casino stats
- Shows live trial updates via WebSocket
- Provides responsive casino UI

**Tech Stack:**
- React 18
- Vite 6
- TypeScript
- Tailwind CSS
- TanStack Query (React Query)
- Socket.IO Client
- Solana Wallet Adapter

**Key Features:**
- ✅ Wallet connection (Phantom, Solflare, Backpack)
- ✅ Real-time trial updates
- ✅ Player statistics
- ✅ Casino dashboard
- ✅ Responsive design

## 🔧 Environment Setup

### Backend (`apps/api/.env`)

```bash
# Casino Configuration
CASINO_NAME="My Casino"
SOLANA_OWNER_ADDRESS="your_solana_wallet_address"

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/casino_db?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# Server
PORT=8080
NODE_ENV=development

# Solana RPC
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
SOLANA_WS_URL="wss://api.mainnet-beta.solana.com"
```

### Frontend (`apps/web/.env`)

```bash
# API Configuration
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=http://localhost:8080

# Solana Configuration
VITE_SOLANA_NETWORK=mainnet-beta
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

## 📡 API Endpoints

### Player Endpoints
```
GET  /api/player/:address                  # Get player info
GET  /api/player/:address/trials           # Get player trials
GET  /api/player/:address/casino/:casinoId # Get player casino stats
```

### Stats Endpoints
```
GET  /api/stats                # Global stats
GET  /api/stats/casino/:id     # Casino stats
GET  /api/stats/pool/:address  # Pool stats
```

### Health Endpoints
```
GET  /api/health       # Health check
GET  /api/health/ready # Readiness check
GET  /api/health/live  # Liveness check
```

## 🔌 WebSocket Events

Connect to `ws://localhost:8080/casino`

**Client → Server:**
```javascript
socket.emit('subscribeLiveTrials', { casinoId: 'xxx' });
socket.emit('subscribePlayerTrials', { address: 'wallet_address' });
```

**Server → Client:**
```javascript
socket.on('trialRegistered', (trial) => { /* ... */ });
socket.on('trialResolved', (trial) => { /* ... */ });
socket.on('statsUpdate', (stats) => { /* ... */ });
```

## 📚 Shared Types

The `packages/types` package contains TypeScript interfaces shared between frontend and backend:

- `Casino`, `Player`, `Trial`
- `PlayerStats`, `CasinoStats`, `GlobalStats`
- `WebSocketEvent` types
- API response types

```typescript
import type { PlayerStats, Trial } from '@fare-casino/types';
```

## 🏗️ Development Workflow

### Adding New Features

1. **Update Types** (if needed)
   ```bash
   cd packages/types
   # Edit src/index.ts
   npm run build
   ```

2. **Backend Changes**
   ```bash
   cd apps/api
   # Make changes
   npm run start:dev
   ```

3. **Frontend Changes**
   ```bash
   cd apps/web
   # Make changes - hot reload automatic
   ```

### Database Migrations

```bash
cd apps/api

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# View database
npx prisma studio
```

## 🧪 Testing

```bash
# Test all packages
npm run test

# Test specific app
npm run test -w @fare-casino/api
npm run test -w @fare-casino/web
```

## 📦 Building for Production

```bash
# Build all packages and apps
npm run build

# Build specific app
npm run build:api
npm run build:web
```

## 🚢 Deployment

### Deploy Backend (Fly.io)

```bash
cd apps/api

# Create app
fly apps create my-casino-api

# Provision databases
fly postgres create --name my-casino-db
fly postgres attach my-casino-db

fly redis create --name my-casino-redis
fly redis attach my-casino-redis

# Set secrets
fly secrets set CASINO_NAME="My Casino" SOLANA_OWNER_ADDRESS="..."

# Deploy
fly deploy
```

### Deploy Frontend (Vercel/Netlify)

```bash
cd apps/web

# Build
npm run build

# Deploy dist/ folder to your hosting provider
```

## 🛠️ Scripts Reference

### Root Level
```bash
npm run dev          # Start all apps in dev mode
npm run build        # Build all apps
npm run dev:api      # Start API only
npm run dev:web      # Start Web only
npm run build:api    # Build API only
npm run build:web    # Build Web only
npm run lint         # Lint all packages
npm run test         # Test all packages
npm run clean        # Clean all node_modules and dist
```

### API (`apps/api`)
```bash
npm run start:dev    # Development mode
npm run build        # Production build
npm run prisma:*     # Prisma commands
```

### Web (`apps/web`)
```bash
npm run dev          # Development mode
npm run build        # Production build
npm run preview      # Preview production build
```

## 🔍 Troubleshooting

### Types Not Found

```bash
cd packages/types
npm run build
```

### Backend Won't Start

1. Check PostgreSQL is running
2. Check Redis is running
3. Verify `.env` file exists in `apps/api`
4. Run `npx prisma generate` in `apps/api`

### Frontend Can't Connect to API

1. Verify API is running on port 8080
2. Check `VITE_API_URL` in `apps/web/.env`
3. Clear browser cache and reload

## 📚 Documentation

- [API Documentation](./apps/api/README.md)
- [Prisma Schema](./apps/api/prisma/schema.prisma)
- [Shared Types](./packages/types/src/index.ts)

## 🤝 Contributing

This is a monorepo using npm workspaces. When adding dependencies:

```bash
# Add to specific workspace
npm install <package> -w @fare-casino/api
npm install <package> -w @fare-casino/web
npm install <package> -w @fare-casino/types

# Add to root (dev dependencies)
npm install <package> -D
```

## 📄 License

UNLICENSED - Proprietary
