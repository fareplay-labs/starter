# Critical Issues Found with Heartbeat Implementation

## 🚨 Problems Discovered

### 1. **API Path Mismatch**
The SDK and Discovery Service have different API paths:

**SDK Paths** (in `/Users/lbattaglioli/Fareplay/sdk/src/client/`):
- Registration: `/api/v1/casinos`
- Heartbeat: `/api/v1/heartbeat`
- Get Casino: `/api/v1/casinos/:id`

**Discovery Service Actual Paths**:
- Registration: `/api/casinos/register`
- Heartbeat: `/api/casinos/heartbeat`
- Get Casino: `/api/casinos/:id`

❌ **Impact**: All heartbeat calls will 404 because the SDK is hitting the wrong endpoints!

### 2. **Missing Casino Registration**
The heartbeat service never registers the casino with the discovery service.

**Required Flow**:
```
1. Casino starts up
2. Register with discovery service → Get casino UUID
3. Store UUID for future use
4. Send heartbeats using that UUID
```

**Current Flow**:
```
1. Casino starts up
2. ❌ Skip registration
3. ❌ Use SOLANA_OWNER_ADDRESS as casinoId (it's a publicKey, not UUID!)
4. ❌ Heartbeats fail because casino doesn't exist
```

### 3. **Casino ID Confusion**
```typescript
// What we're doing:
const casinoId = this.configService.get<string>('SOLANA_OWNER_ADDRESS');
// This is a Solana publicKey like: "7xK9abc..."

// What discovery service expects:
casinoId: "550e8400-e29b-41d4-a716-446655440000"  // UUID from registration
```

The discovery service:
- Takes your `publicKey` during registration
- Returns a UUID `casinoId`
- Uses that UUID for all subsequent operations
- Validates heartbeat signatures against the stored publicKey

### 4. **No Persistence of Casino UUID**
Even if we register, we don't store the returned UUID anywhere. This means:
- Every restart would try to re-register (causing errors)
- We can't send heartbeats because we don't know our UUID

### 5. **Discovery Service Expected Payload**

**Registration Payload**:
```typescript
{
  name: string;              // e.g., "My Awesome Casino"
  url: string;               // e.g., "https://my-casino.com"
  publicKey: string;         // Solana public key (base58)
  signature: string;         // Signature of above data
  metadata: {
    description?: string;
    games: string[];         // ['slots', 'dice', 'roulette']
    logo?: string;
    banner?: string;
    socialLinks?: {
      twitter?: string;
      discord?: string;
      telegram?: string;
      website?: string;
    };
    maxBetAmount?: number;
    minBetAmount?: number;
    supportedTokens: string[]; // ['SOL']
  }
}
```

**Heartbeat Payload**:
```typescript
{
  casinoId: string;          // UUID from registration!
  status: 'online' | 'offline' | 'maintenance' | 'suspended';
  timestamp: number;         // Unix timestamp in milliseconds
  metrics?: {
    activePlayers?: number;
    totalBets24h?: number;
    uptime?: number;         // In seconds
    responseTime?: number;   // In milliseconds
  };
  signature: string;         // Signature of above data
}
```

## ✅ What We Need to Fix

### Fix 1: Update SDK API Paths
The SDK needs to use the correct paths. Two options:

**Option A: Fix the SDK** (Recommended)
Update paths in both client files:
```typescript
// casinoClient.ts
'/api/casinos/heartbeat'  // not '/api/v1/heartbeat'

// discoveryClient.ts
'/api/casinos/register'   // not '/api/v1/casinos'
'/api/casinos/:id'        // not '/api/v1/casinos/:id'
// etc.
```

**Option B: Add API Version Prefix to Discovery Service**
Add `/api/v1` prefix to all routes in discovery service (breaking change).

### Fix 2: Implement Registration Flow
Update `heartbeat.service.ts`:

```typescript
@Injectable()
export class HeartbeatService implements OnModuleInit {
  private client: FareCasinoClient | null = null;
  private discoveryClient: FareDiscoveryClient | null = null;
  private casinoId: string | null = null;
  private enabled = false;

  async onModuleInit() {
    // 1. Check if already registered (load from database)
    let registration = await this.prisma.casinoRegistration.findUnique({
      where: { id: 'singleton' }
    });

    if (!registration) {
      // 2. Register with discovery service
      const casinoSettings = await this.getCasinoSettings();
      const registered = await this.registerCasino(casinoSettings);
      
      // 3. Save UUID to database
      registration = await this.prisma.casinoRegistration.create({
        data: {
          id: 'singleton',
          casinoId: registered.id,
          publicKey: registered.publicKey,
        }
      });
    }

    // 4. Initialize heartbeat client with UUID
    this.casinoId = registration.casinoId;
    this.client = new FareCasinoClient({
      baseUrl: 'https://discovery.fareplay.io',
      casinoId: this.casinoId,  // Use UUID, not publicKey!
      privateKey: this.configService.get('HEARTBEAT_PRIVATE_KEY'),
    });

    this.enabled = true;
  }

  private async registerCasino(settings: CasinoSettings) {
    this.discoveryClient = new FareDiscoveryClient({
      baseUrl: 'https://discovery.fareplay.io',
    });

    // Build registration payload
    const registrationData = {
      name: settings.name || 'Unnamed Casino',
      url: settings.websiteUrl || process.env.FRONTEND_URL,
      publicKey: this.configService.get('SOLANA_OWNER_ADDRESS'),
      metadata: {
        description: settings.longDescription,
        games: [], // Get from Game table
        logo: settings.logoUrl,
        banner: settings.bannerUrl,
        supportedTokens: ['SOL'],
      }
    };

    // Sign and register
    const signedPayload = createSignedPayload(
      registrationData,
      this.configService.get('HEARTBEAT_PRIVATE_KEY')
    );

    return await this.discoveryClient.registerCasino(signedPayload);
  }
}
```

### Fix 3: Add Database Table for Registration
```prisma
// Add to schema.prisma
model CasinoRegistration {
  id         String   @id @default("singleton")
  casinoId   String   // UUID from discovery service
  publicKey  String   // Our Solana public key
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

### Fix 4: Environment Variables
Update `.env` to include more casino info:
```env
# Solana Configuration
SOLANA_OWNER_ADDRESS=<your-wallet-address>
HEARTBEAT_PRIVATE_KEY=<generated-base58-key>

# Casino Info (for registration)
CASINO_NAME=My Awesome Casino
CASINO_URL=https://my-casino.com
FRONTEND_URL=https://my-casino.com
```

Update CLI to generate these during init.

### Fix 5: Healthcheck for Registration
Add an endpoint to check registration status:
```typescript
@Get('/registration-status')
async getRegistrationStatus() {
  const registration = await this.prisma.casinoRegistration.findUnique({
    where: { id: 'singleton' }
  });

  if (!registration) {
    return { registered: false };
  }

  // Check with discovery service
  try {
    const casino = await discoveryClient.getCasino(registration.casinoId);
    return {
      registered: true,
      casinoId: registration.casinoId,
      status: casino.status,
      lastHeartbeat: casino.lastHeartbeat,
    };
  } catch (error) {
    return {
      registered: false,
      error: 'Casino not found in discovery service'
    };
  }
}
```

## 📋 Implementation Checklist

### SDK Fixes
- [ ] Update `casinoClient.ts` to use `/api/casinos/heartbeat`
- [ ] Update `discoveryClient.ts` to use `/api/casinos/*` paths
- [ ] Add helper method in SDK for signed registration
- [ ] Rebuild SDK
- [ ] Test SDK against discovery service

### Backend Fixes
- [ ] Add `CasinoRegistration` table to schema
- [ ] Run migration
- [ ] Update `HeartbeatService` to handle registration
- [ ] Add registration check on startup
- [ ] Store and use UUID instead of publicKey
- [ ] Add registration status endpoint
- [ ] Update environment variables

### CLI Fixes
- [ ] Add `CASINO_NAME` prompt during init
- [ ] Add `CASINO_URL` / `FRONTEND_URL` configuration
- [ ] Add registration validation step
- [ ] Update documentation

### Testing
- [ ] Test registration flow locally
- [ ] Verify UUID is stored correctly
- [ ] Confirm heartbeats use UUID not publicKey
- [ ] Test with actual discovery service
- [ ] Verify signature validation works

## 🎯 Quick Fix for Testing

If you want to test heartbeats immediately without registration:

1. **Manually register using curl**:
```bash
# Sign the payload first (use SDK or write helper script)
curl -X POST https://discovery.fareplay.io/api/casinos/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Casino",
    "url": "https://test-casino.com",
    "publicKey": "<YOUR_SOLANA_OWNER_ADDRESS>",
    "signature": "<SIGNED_PAYLOAD>",
    "metadata": {
      "games": ["slots", "dice"],
      "supportedTokens": ["SOL"]
    }
  }'
```

2. **Save the returned UUID** to your database manually

3. **Update heartbeat service** to use that UUID

4. **Test heartbeats**

## 🚀 Priority Order

1. **Fix SDK API paths** (blocks everything)
2. **Implement registration in HeartbeatService** (critical)
3. **Add CasinoRegistration table** (needed for persistence)
4. **Update CLI to collect casino info** (UX improvement)
5. **Add registration status endpoint** (monitoring)

## 📊 Expected Timeline

- SDK path fixes: **15 minutes**
- Registration implementation: **1-2 hours**
- Database migration: **10 minutes**
- CLI updates: **30 minutes**
- Testing & verification: **1 hour**

**Total**: **3-4 hours** for complete implementation

## ❓ Questions to Answer

1. **Should registration happen automatically on first startup?**
   - Yes (recommended): Auto-register using CasinoSettings
   - No: Require manual registration via CLI command

2. **What happens if registration fails?**
   - Retry on next startup?
   - Disable heartbeat service?
   - Alert admin?

3. **Should we support re-registration?**
   - If casino changes ownership (new publicKey)
   - If casino is deleted from discovery service
   - CLI command to force re-registration

4. **How to handle multiple environments?**
   - Dev/staging/prod might have different UUIDs
   - Need env-specific registration storage

## 📚 Related Documentation

- Discovery Service API: `/Users/lbattaglioli/Fareplay/discovery/src/routes/casinos.ts`
- SDK Casino Client: `/Users/lbattaglioli/Fareplay/sdk/src/client/casinoClient.ts`
- SDK Discovery Client: `/Users/lbattaglioli/Fareplay/sdk/src/client/discoveryClient.ts`
- Current Heartbeat Service: `/Users/lbattaglioli/Fareplay/fare-casino-starter/apps/api/src/modules/heartbeat/heartbeat.service.ts`

---

**Status**: 🔴 Critical issues found - Implementation incomplete
**Next Step**: Fix SDK API paths and implement registration flow
**Owner**: Backend team
**Priority**: P0 - Blocks production launch

