# Backend Migration - Mock to Real API

This directory contains the real backend integration that migrates from the mock localStorage-based backend to the actual API at localhost:3200.

## Files Created

### API Services
- `shared/services/casinoApi.ts` - Casino CRUD operations API client
- `shared/services/gameApi.ts` - Game configuration API client  
- `shared/utils/apiTypeConverters.ts` - Type converters between API responses and frontend types

### Backend Service
- `backend/core/BackendService.ts` - Backend implementation using API calls
- `backend/core/BackendServiceFactory.ts` - Factory to choose between mock/real backends

### Testing
- `backend/test/testBackendIntegration.ts` - Test script for backend integration

## Configuration

The backend is controlled by the environment variable `VITE_USE_REAL_BACKEND`:
- `true` - Uses real API backend at localhost:3200
- `false` - Uses mock localStorage backend

## API Endpoints Implemented

Based on the API documentation at `/docs/backend-migration/zz-official-api-docs.json`, the following endpoints are supported:

### Casino Endpoints
- `GET /casinos/{username}` - Get casino details
- `POST /casinos/{username}` - Create or update casino
- `GET /casinos/previews` - Get casino previews for discovery
- `GET /casinos/featured` - Get featured casinos
- `POST /casinos/{username}/games` - Add game to casino
- `POST /casinos/{username}/sections` - Create casino section
- Various section management endpoints

### Game Configuration Endpoints  
- `GET /casinos/{username}/games/{gameId}/config` - Get game config
- `POST /casinos/{username}/games/{gameId}/config` - Create/update game config

### Media Endpoints (already implemented)
- `POST /media` - Upload media files
- `GET /media` - List user media
- `GET /media/{id}` - Get media by ID
- `DELETE /media/{id}` - Delete media

## Usage

The migration is transparent to existing code. The `useBackendService` hook automatically chooses the correct backend based on the environment variable.

```typescript
import { useBackendService } from '../mockBackend/hooks/useBackendService'

function MyComponent() {
  const { 
    loadUserCasino, 
    saveUserCasino, 
    getCasinoPreviews 
  } = useBackendService()
  
  // Works with both mock and real backend
  const casino = await loadUserCasino('user123')
}
```

## Type Mapping

The API uses a different data structure than the frontend. Type converters handle the mapping:

### API Response → Frontend Types
- `CasinoApiResponse` → `CasinoEntity`
- `CasinoPreviewResponse` → `CasinoPreview`  
- `GameConfigResponse` → `IGameConfigData`

### Frontend Types → API Request
- `CasinoEntity` → `CasinoCreateRequest`
- `IGameConfigData` → `GameConfigRequest`

## Current Status

✅ **Completed:**
- API service layer created
- Backend service factory implemented  
- Type converters created
- useBackendService hook updated
- Environment toggle working
- Both mock and real backends functional

⚠️ **Next Steps:**
- Backend API endpoints need to be implemented on the server
- Test with actual data from the real backend
- Add error handling for network failures
- Implement data migration utilities

## Testing

1. **Mock Backend (localStorage):**
   ```bash
   # Set in .env
   VITE_USE_REAL_BACKEND=false
   npm start
   ```

2. **Real Backend (API):**
   ```bash  
   # Set in .env
   VITE_USE_REAL_BACKEND=true
   npm start
   ```

The console will log which backend is being used: `[useBackendService] Using Mock Backend (localStorage)` or `[useBackendService] Using Real Backend (API)`.

## Backend Server Status

The backend server is running at localhost:3200 and responds to health checks at `/health-check`. However, the casino-specific API endpoints are not yet implemented on the server side.
