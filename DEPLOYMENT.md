# Deployment Guide

## 🎯 Architecture

```
┌─────────────────┐
│   Vercel        │  Frontend (React + Vite)
│   (Global CDN)  │  https://your-casino.vercel.app
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│   Fly.io        │  Backend API (NestJS)
│   ├─ API        │  https://your-api.fly.dev
│   ├─ PostgreSQL │  (Managed)
│   └─ Redis      │  (Managed)
└─────────────────┘
```

## 🚀 Backend Deployment (Fly.io)

### 1. Prerequisites

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login
```

### 2. Create Application

```bash
cd apps/api

# Create app (change name as needed)
fly apps create my-casino-api --region sjc
```

### 3. Provision Databases

```bash
# PostgreSQL (managed)
fly postgres create --name my-casino-db --region sjc
fly postgres attach my-casino-db --app my-casino-api

# Redis (managed)
fly redis create --name my-casino-redis --region sjc
fly redis attach my-casino-redis --app my-casino-api
```

### 4. Set Environment Variables

```bash
fly secrets set \
  CASINO_NAME="Your Casino Name" \
  SOLANA_OWNER_ADDRESS="your_solana_wallet_address" \
  SOLANA_RPC_URL="https://api.mainnet-beta.solana.com" \
  SOLANA_WS_URL="wss://api.mainnet-beta.solana.com" \
  --app my-casino-api
```

### 5. Run Database Migrations

```bash
# SSH into Fly.io machine
fly ssh console --app my-casino-api

# Inside the container:
cd /app && npx prisma migrate deploy
exit
```

Or use this one-liner:
```bash
fly ssh console --app my-casino-api -C "cd /app && npx prisma migrate deploy"
```

### 6. Deploy!

```bash
fly deploy

# Your API will be live at:
# https://my-casino-api.fly.dev
```

### 7. Verify Deployment

```bash
curl https://my-casino-api.fly.dev/api/health
```

---

## 🎨 Frontend Deployment (Vercel)

### Option 1: Vercel CLI (Quick)

```bash
# Install Vercel CLI
npm i -g vercel

cd apps/web

# Login
vercel login

# Deploy to production
vercel --prod
```

### Option 2: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - **Root Directory**: `apps/web`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Set Environment Variables in Vercel**
   ```
   VITE_API_URL=https://my-casino-api.fly.dev/api
   VITE_WS_URL=https://my-casino-api.fly.dev
   VITE_SOLANA_NETWORK=mainnet-beta
   VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Done! Auto-deploys on every push to main 🎉

---

## 🔄 Continuous Deployment

### Backend (Fly.io)
```bash
# Deploy from command line
cd apps/api
fly deploy

# Or set up GitHub Actions
```

### Frontend (Vercel)
- Automatically deploys on every push to `main`
- Preview deployments on every PR
- No configuration needed!

---

## 📊 Monitoring

### Check Backend Status
```bash
fly status --app my-casino-api
fly logs --app my-casino-api
```

### Check Frontend Status
- Vercel Dashboard: https://vercel.com/dashboard
- Real-time logs and analytics included

---

## 💰 Cost Estimate

| Service | Component | Cost |
|---------|-----------|------|
| Fly.io | API (1 VM, 512MB) | ~$5/month |
| Fly.io | PostgreSQL (Shared) | Free |
| Fly.io | Redis (256MB) | ~$2/month |
| Vercel | Frontend + CDN | **FREE** |
| **Total** | | **~$7/month** |

---

## 🔐 Security Checklist

- [ ] Update `SOLANA_OWNER_ADDRESS` with your real address
- [ ] Set strong database password (Fly does this automatically)
- [ ] Configure CORS in API for your Vercel domain
- [ ] Enable HTTPS (automatic on both Fly.io and Vercel)
- [ ] Set up rate limiting in API
- [ ] Review Vercel deployment protection settings

---

## 🐛 Troubleshooting

### API Won't Start
```bash
# Check logs
fly logs --app my-casino-api

# Check secrets
fly secrets list --app my-casino-api

# Restart
fly apps restart my-casino-api
```

### Frontend Can't Connect to API
1. Check CORS settings in API
2. Verify `VITE_API_URL` in Vercel env vars
3. Check if API is actually running: `fly status`

### Database Connection Issues
```bash
# Check PostgreSQL connection
fly postgres connect --app my-casino-db

# Inside postgres:
\l                    # List databases
\c casino_db         # Connect to database
\dt                  # List tables
```

---

## 🔄 Rollback

### Backend
```bash
fly releases --app my-casino-api
fly releases rollback <version> --app my-casino-api
```

### Frontend
- Go to Vercel Dashboard → Deployments
- Click on previous deployment → "Promote to Production"

---

## 📚 Additional Resources

- [Fly.io Docs](https://fly.io/docs)
- [Vercel Docs](https://vercel.com/docs)
- [NestJS Deployment](https://docs.nestjs.com/faq/deployment)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)

