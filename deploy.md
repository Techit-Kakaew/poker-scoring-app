# Deployment Guide

## Local Development

```bash
npm run dev
```

Visit `http://localhost:3000` to view the application.

## Production Build

```bash
npm run build
npm run start
```

## Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically with zero configuration

## Deploy to Other Platforms

### Netlify
1. Build the project: `npm run build`
2. Deploy the `out` folder (if using static export)

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Environment Variables

Currently no environment variables are required for basic functionality.

For future features (like real-time sync), you might need:
- `DATABASE_URL` - For persistent storage
- `WEBSOCKET_URL` - For real-time updates
