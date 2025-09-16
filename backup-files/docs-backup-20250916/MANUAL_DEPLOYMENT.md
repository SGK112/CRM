# Manual Deployment Fix Guide

## Current Situation
- ✅ Both backend and frontend build successfully locally
- ❌ Render automated deployment is failing due to workspace configuration issues
- ❌ Static assets returning 404 in production

## Quick Manual Fix

### Step 1: Deploy Backend First
1. Go to Render Dashboard
2. Create new Web Service
3. Connect to GitHub repo: `SGK112/CRM`
4. Configuration:
   ```
   Name: remodely-crm-backend
   Environment: Node
   Build Command: cd apps/backend && npm install && npm run build
   Start Command: cd apps/backend && npm run start:prod
   Health Check Path: /health
   ```
5. Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000 (or whatever Render assigns)
   JWT_SECRET=your-jwt-secret
   MONGODB_URI=your-mongodb-connection-string
   FRONTEND_URL=https://remodely-crm-frontend.onrender.com
   CORS_ORIGINS=https://remodely-crm-frontend.onrender.com
   ```

### Step 2: Deploy Frontend
1. Create another Web Service
2. Configuration:
   ```
   Name: remodely-crm-frontend
   Environment: Node
   Build Command: cd apps/frontend && npm install && npm run build
   Start Command: cd apps/frontend && npm start
   ```
3. Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000 (or whatever Render assigns)
   NEXT_PUBLIC_API_URL=https://remodely-crm-backend.onrender.com/api
   NEXT_PUBLIC_SOCKET_URL=https://remodely-crm-backend.onrender.com
   ```

## Alternative: Use Docker Deployment

### Backend Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
RUN npm ci --workspace=apps/backend
COPY apps/backend ./apps/backend
RUN npm run build --workspace=apps/backend
EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "apps/backend/dist/main.js"]
```

### Frontend Docker
Use the existing `apps/frontend/Dockerfile` which is already optimized.

## Test URLs
- Backend Health: https://remodely-crm-backend.onrender.com/health
- Frontend: https://remodely-crm-frontend.onrender.com

## If Still Broken
The issue might be:
1. Environment variables not properly set
2. Database connection issues
3. CORS configuration problems
4. Static asset serving (Next.js standalone mode issues)

## Next Steps
1. Delete the current broken deployments
2. Create new services manually with the above configurations
3. Test each service individually
4. Update environment variables to point to each other
