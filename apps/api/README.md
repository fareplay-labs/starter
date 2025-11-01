# Casino Backend API

NestJS-based backend for processing Solana blockchain events and providing casino APIs.

## Quick Start

```bash
# Install dependencies (from root)
cd ../..
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development server
npm run start:dev
```

## Available at
- REST API: http://localhost:8080/api
- WebSocket: ws://localhost:8080/casino
- Health: http://localhost:8080/api/health

## Documentation

See the [main README](../../README.md) for full documentation.

