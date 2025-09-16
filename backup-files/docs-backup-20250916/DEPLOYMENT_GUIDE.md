# 🚀 Remodely CRM Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. Build Verification
- [x] All packages build successfully
- [x] Frontend build completed without errors
- [x] Backend build completed without errors
- [x] Wallet API endpoints fixed and functional

### 2. Environment Configuration
- [x] Environment variables template ready
- [x] Production-ready Next.js configuration
- [x] API routing configured correctly
- [x] CORS settings ready for production

### 3. Database & Services
- [x] MongoDB connection ready
- [x] Authentication system functional
- [x] File upload endpoints working
- [x] API health check endpoints available

---

## 🎯 Deployment Options

### Option 1: Render.com (Recommended)
The project is pre-configured for Render deployment with `render.yaml`.

#### Quick Deploy Steps:
1. **Connect Repository**: Link your GitHub repository to Render
2. **Environment Variables**: Set the following in Render dashboard:
   ```bash
   NODE_ENV=production
   MONGODB_URI=<your-mongodb-connection-string>
   JWT_SECRET=<secure-random-string>
   
   # API Keys (required for AI features)
   OPENAI_API_KEY=<your-openai-key>
   XAI_API_KEY=<your-xai-key>
   ANTHROPIC_API_KEY=<your-anthropic-key>
   
   # Email service (optional)
   SENDGRID_API_KEY=<your-sendgrid-key>
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   SENDGRID_FROM_NAME=Your CRM Name
   
   # OAuth (optional)
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   
   # Stripe (optional)
   STRIPE_SECRET_KEY=<your-stripe-secret-key>
   STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
   ```

3. **Deploy**: Render will automatically build and deploy both services

#### Service Configuration:
- **Backend**: `remodely-crm-backend` - Handles API requests
- **Frontend**: `remodely-crm-frontend` - Serves the web application
- **Database**: MongoDB Atlas or Render PostgreSQL

### Option 2: Docker Deployment
Use the included Dockerfiles for containerized deployment.

```bash
# Build and run backend
cd apps/backend
docker build -t remodely-crm-backend .
docker run -p 3001:3001 --env-file .env remodely-crm-backend

# Build and run frontend
cd apps/frontend
docker build -t remodely-crm-frontend .
docker run -p 3000:3000 --env-file .env remodely-crm-frontend
```

### Option 3: Manual VPS Deployment
1. **Server Requirements**:
   - Node.js 18+
   - MongoDB 5.0+
   - PM2 (process manager)
   - Nginx (reverse proxy)

2. **Build and Deploy**:
   ```bash
   # Clone repository
   git clone <your-repo-url>
   cd remodely-crm
   
   # Install dependencies
   npm install
   
   # Build all packages
   npm run build
   
   # Start with PM2
   pm2 start ecosystem.config.js
   ```

---

## 🔧 Production Environment Variables

### Essential Variables
```bash
# Core
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crm

# Security
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
CORS_ORIGINS=https://yourdomain.com

# Frontend URLs
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_FRONTEND_URL=https://your-frontend-domain.com
```

### Optional Service Integrations
```bash
# AI Services
OPENAI_API_KEY=sk-...
XAI_API_KEY=xai-...
ANTHROPIC_API_KEY=sk-ant-...

# Email
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Authentication
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Communications
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...

# File Storage
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)
1. Create a MongoDB Atlas cluster
2. Create a database user
3. Whitelist your deployment IPs
4. Get the connection string
5. Set `MONGODB_URI` environment variable

### Local MongoDB
```bash
# Install MongoDB
# macOS: brew install mongodb-community
# Ubuntu: apt install mongodb

# Start service
mongod --dbpath /path/to/data/directory
```

---

## 🚀 Deployment Scripts

### Build Script
```bash
#!/bin/bash
echo "🔨 Building Remodely CRM..."
npm install
npm run build
echo "✅ Build complete!"
```

### Start Script
```bash
#!/bin/bash
echo "🚀 Starting Remodely CRM..."
npm run start
echo "✅ Services started!"
```

---

## 🔍 Health Checks

### Backend Health Check
- **URL**: `GET /api/health`
- **Expected Response**: `{ "status": "ok", "timestamp": "..." }`

### Frontend Health Check
- **URL**: `GET /`
- **Expected**: Successful page load

---

## 🛡️ Security Considerations

### Environment Security
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS in production
- [ ] Set strong JWT secrets (32+ characters)
- [ ] Configure CORS properly
- [ ] Use secure database connections

### Rate Limiting
- Configured for 100 requests per 15 minutes per IP
- Adjustable in backend configuration

### Authentication
- JWT-based authentication
- Google OAuth integration available
- Password hashing with bcrypt

---

## 📊 Monitoring & Logging

### Application Monitoring
- Health check endpoints available
- Error logging configured
- Performance monitoring ready

### Database Monitoring
- MongoDB connection health
- Query performance tracking
- Backup recommendations

---

## 🔄 Updates & Maintenance

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build application
npm run build

# Restart services
npm run start
```

### Database Migrations
- Schema changes handled automatically
- Backup database before major updates
- Test migrations in staging first

---

## ⚡ Performance Optimization

### Frontend Optimizations
- [x] Next.js standalone build enabled
- [x] Static asset optimization
- [x] Image optimization configured
- [x] Compression enabled

### Backend Optimizations
- [x] Response compression
- [x] Rate limiting
- [x] Database indexing
- [x] Caching headers

---

## 🆘 Troubleshooting

### Common Issues

#### Build Failures
- Check Node.js version (18+ required)
- Clear node_modules and reinstall
- Verify all environment variables

#### Database Connection Issues
- Verify MongoDB URI format
- Check network connectivity
- Ensure database user permissions

#### API Issues
- Check CORS configuration
- Verify environment variables
- Check service health endpoints

### Debug Commands
```bash
# Check service status
npm run dev:status

# View logs
npm run logs

# Test build locally
npm run build
```

---

## 📞 Support

For deployment assistance:
1. Check this guide first
2. Review error logs
3. Check environment configuration
4. Contact development team

---

## 🎉 Ready for Production!

Your Remodely CRM is now ready for deployment with:
- ✅ Production-optimized builds
- ✅ Security best practices
- ✅ Scalable architecture
- ✅ Monitoring capabilities
- ✅ Comprehensive documentation

Choose your deployment method and follow the steps above to go live!
