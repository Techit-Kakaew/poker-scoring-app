# Vercel Build & Output Configuration Guide

## 📋 Pre-Deployment Setup

Before deploying to Vercel, you can configure various build and output settings to optimize your poker scoring app.

## 🔧 Configuration Files Overview

### 1. `vercel.json` - Main Vercel Configuration

```json
{
  "version": 2,
  "name": "poker-scoring-app",
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "devCommand": "npm run dev",
  "regions": ["iad1", "sfo1"]
}
```

**Key Settings Explained:**

- **`buildCommand`**: Command to build your app (`npm run build`)
- **`outputDirectory`**: Where Next.js outputs built files (`.next`)
- **`installCommand`**: How to install dependencies (`npm ci` for faster, deterministic installs)
- **`regions`**: Deploy to specific regions for better performance
- **`framework`**: Auto-detects Next.js settings

### 2. `next.config.js` - Next.js Optimization

```javascript
const nextConfig = {
  output: 'standalone',        // Optimized for serverless
  compress: true,              // Enable gzip compression
  poweredByHeader: false,      // Remove "X-Powered-By" header
  generateEtags: false,        // Disable ETags for better caching
}
```

### 3. Environment Variables

Create `.env.local` for development:
```bash
cp .env.local.example .env.local
```

## 🚀 Vercel Dashboard Configuration

### Step 1: Project Settings

1. **Go to Vercel Dashboard** → Your Project → Settings

2. **General Settings**:
   ```
   Project Name: poker-scoring-app
   Framework Preset: Next.js
   Root Directory: ./
   Node.js Version: 20.x
   ```

### Step 2: Build & Output Settings

**Build Settings**:
```bash
# Build Command
npm run build

# Output Directory  
.next

# Install Command
npm ci

# Development Command
npm run dev
```

**Advanced Build Settings**:
```bash
# Node.js Version
20.x

# Environment Variables (Build Time)
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Step 3: Function Settings

```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

**What this configures**:
- **Runtime**: Node.js 20.x for latest features
- **Max Duration**: 30 seconds (plenty for API calls)
- **Memory**: 1024 MB (sufficient for session storage)

### Step 4: Environment Variables

**In Vercel Dashboard** → Settings → Environment Variables:

#### Production Variables
```
NODE_ENV = production
NEXT_TELEMETRY_DISABLED = 1
NEXT_PUBLIC_APP_NAME = Poker Scoring App
NEXT_PUBLIC_APP_VERSION = 1.0.0
```

#### Optional Performance Variables
```
SESSION_TIMEOUT_MINUTES = 60
PLAYER_TIMEOUT_MINUTES = 5
POLLING_INTERVAL_MS = 2000
MAX_PLAYERS_PER_SESSION = 20
```

#### Optional External Services (for scaling)
```
DATABASE_URL = postgresql://...
REDIS_URL = redis://...
```

### Step 5: Domain & DNS

**Custom Domain Setup**:
1. Go to Settings → Domains
2. Add your domain: `poker.yourdomain.com`
3. Configure DNS:
   ```
   Type: CNAME
   Name: poker
   Value: cname.vercel-dns.com
   ```

## 🎯 Performance Optimization Settings

### Edge Functions Configuration

For better global performance:

```json
{
  "functions": {
    "src/app/api/sessions/[sessionId]/route.ts": {
      "runtime": "edge"
    }
  }
}
```

### Caching Headers

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
}
```

### Compression & Security

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options", 
          "value": "DENY"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

## 🔍 Build Monitoring & Analytics

### Build Logs
Monitor your builds in real-time:
1. Go to Deployments tab
2. Click on any deployment
3. View Function Logs for API debugging

### Performance Monitoring
```bash
# Add to package.json for bundle analysis
"analyze": "ANALYZE=true npm run build"
```

### Health Checks
Access: `https://your-app.vercel.app/health`

Returns:
```json
{
  "status": "healthy",
  "activeSessionsCount": 5,
  "totalActivePlayers": 12,
  "memory": {...},
  "uptime": 3600
}
```

## 🛠 Advanced Configuration Options

### 1. Regional Deployment
```json
{
  "regions": ["iad1", "sfo1", "fra1"]
}
```
**Recommended regions**:
- `iad1` - US East (Virginia)
- `sfo1` - US West (San Francisco)  
- `fra1` - Europe (Frankfurt)

### 2. Build Output Optimization
```javascript
// next.config.js
{
  output: 'standalone',  // Smaller deployment bundle
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./lib/**/*']
    }
  }
}
```

### 3. Serverless Function Config
```json
{
  "functions": {
    "src/app/api/sessions/join/route.ts": {
      "memory": 512,
      "maxDuration": 10
    },
    "src/app/api/sessions/[sessionId]/route.ts": {
      "memory": 256,
      "maxDuration": 5
    }
  }
}
```

## 📊 Build Time Optimization

### Package.json Scripts
```json
{
  "scripts": {
    "build": "next build",
    "build:analyze": "ANALYZE=true next build",
    "build:standalone": "next build && next export",
    "vercel-build": "npm run build"
  }
}
```

### Dependencies Optimization
```bash
# Use exact versions for consistent builds
npm ci --production

# Remove dev dependencies in production
NODE_ENV=production npm ci --omit=dev
```

## 🚀 Deployment Commands

### Local Testing Before Deploy
```bash
# Test production build locally
npm run build
npm start

# Test with Vercel CLI
npx vercel dev
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Automatic Deployments
1. Connect GitHub repository
2. Enable auto-deploy on push to `main`
3. Set up preview deployments for PRs

## 🎯 Recommended Configuration for Poker App

For optimal performance of your poker scoring app:

```json
{
  "version": 2,
  "name": "poker-scoring-app",
  "regions": ["iad1", "sfo1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "crons": [
    {
      "path": "/api/cleanup",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

This configuration provides:
- ✅ **Global performance** with multi-region deployment
- ✅ **Optimal memory** for session storage
- ✅ **Automatic cleanup** every 6 hours
- ✅ **Latest Node.js** for best performance
- ✅ **Security headers** for production use

## 🎉 Ready to Deploy!

Your poker scoring app is now configured for optimal Vercel deployment. Just push to GitHub and watch it deploy automatically! 🚀
