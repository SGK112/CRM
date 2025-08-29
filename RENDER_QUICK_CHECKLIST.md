# 📋 Quick Setup Checklist for Render Deployment

## ✅ Your Current Setup Status

Based on your environment variables, you're **95% ready** for deployment! 

## 🔧 Missing Environment Variables to Add

### **Backend Service - Add These Variables:**

```bash
# AI Service Standardization (map your existing values)
ANTHROPIC_API_KEY=<copy-value-from-Claude_AI_SK_API_KEY>
GEMINI_API_KEY=<copy-value-from-GOOGLE_GEMINI_API_KEY>

# AI Configuration
GEMINI_MODEL=gemini-1.5-pro
DISABLE_GEMINI=false

# Performance & Logging
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
WEB_CONCURRENCY=2
MAX_OLD_SPACE_SIZE=460

# App Features
ENABLE_COMPRESSION=true
CACHE_TTL=300
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Frontend Integration
NEXT_PUBLIC_COPILOT_CHAT_ONLY=true
NEXT_PUBLIC_COPILOT_SYSTEM_PROMPT=You are Remodely AI, an intelligent CRM assistant for construction professionals. Provide helpful, accurate, and concise responses.
NEXT_PUBLIC_COPILOT_SUPPRESS_WARNINGS=true
```

## 🌐 Frontend Service Setup

**Create a new Web Service** for your frontend with these variables:

```bash
# Core
NODE_ENV=production
PORT=3000

# API Connection
NEXT_PUBLIC_API_URL=https://remodely-crm-backend.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://remodely-crm-backend.onrender.com
NEXT_PUBLIC_FRONTEND_URL=https://remodely-crm-frontend.onrender.com

# Stripe Public Key (if you have payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key

# AI Features
NEXT_PUBLIC_COPILOT_CHAT_ONLY=true
NEXT_PUBLIC_COPILOT_SYSTEM_PROMPT=You are Remodely AI, an intelligent CRM assistant for construction professionals. Provide helpful, accurate, and concise responses.
NEXT_PUBLIC_COPILOT_SUPPRESS_WARNINGS=true

# Performance
WEB_CONCURRENCY=1
MAX_OLD_SPACE_SIZE=460
```

## 🏗️ Service Configuration

### **Backend Service Settings:**
- **Name**: `remodely-crm-backend`
- **Environment**: Node
- **Region**: Oregon (or your preference)
- **Plan**: Starter (upgrade to Standard for production)
- **Build Command**: 
  ```bash
  npm ci --production=false && npm run build
  ```
- **Start Command**: 
  ```bash
  cd apps/backend && npm run start:prod
  ```
- **Health Check Path**: `/api/health`

### **Frontend Service Settings:**
- **Name**: `remodely-crm-frontend`
- **Environment**: Node
- **Region**: Oregon (same as backend)
- **Plan**: Starter (upgrade to Standard for production)
- **Build Command**: 
  ```bash
  npm ci --production=false && npm run build
  ```
- **Start Command**: 
  ```bash
  cd apps/frontend && node .next/standalone/apps/frontend/server.js
  ```

## 🎯 Deployment Steps

### **Option 1: Using render.yaml (Recommended)**
1. ✅ Your code is already pushed to GitHub
2. ✅ Go to Render Dashboard
3. ✅ Click "New" → "Blueprint"
4. ✅ Connect your GitHub repository
5. ✅ Render will auto-detect `render.yaml`
6. ✅ Add your environment variables
7. ✅ Deploy!

### **Option 2: Manual Service Creation**
1. ✅ Create Backend Service manually with settings above
2. ✅ Create Frontend Service manually with settings above
3. ✅ Add all environment variables
4. ✅ Deploy both services

## 🔍 Post-Deployment Verification

After deployment, test these URLs:

### **Backend Tests:**
```bash
# Health check
curl https://your-backend-url.onrender.com/api/health

# Auth endpoint (should return 401)
curl https://your-backend-url.onrender.com/api/auth/profile
```

### **Frontend Test:**
```bash
# Homepage (should load CRM interface)
curl https://your-frontend-url.onrender.com
```

## 🚨 Quick Troubleshooting

### **Build Fails:**
- Check build logs in Render dashboard
- Verify Node.js version compatibility
- Ensure all dependencies are installed

### **503 Service Unavailable:**
- Check if services are still starting up
- Verify start commands are correct
- Check memory limits aren't exceeded

### **API Connection Issues:**
- Verify `NEXT_PUBLIC_API_URL` points to backend
- Check CORS settings include frontend URL
- Ensure both services are deployed

## 🎊 Success Indicators

When everything is working, you should see:

✅ **Backend Service**: Healthy status in Render dashboard  
✅ **Frontend Service**: Healthy status in Render dashboard  
✅ **Health Check**: Returns `{"status": "ok"}`  
✅ **Login Page**: Loads without errors  
✅ **AI Features**: Chat works with your API keys  
✅ **Database**: Connects successfully  

## 🚀 Final Notes

- **Startup Time**: First deploy may take 5-10 minutes
- **Cold Starts**: Free tier services sleep after 15 min inactivity
- **Logs**: Check Render dashboard for detailed logs
- **Scaling**: Upgrade to paid plans for better performance

You're all set! Your comprehensive environment variable setup shows you have all the major integrations ready. Just add the missing standardized names and deploy! 🎉
