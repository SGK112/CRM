# 🚀 Quick Reference Card - Remodely CRM

## 🔥 Most Used Commands

### Development
```bash
npm run dev                    # Start full development server
./start-dev-robust.sh         # Robust startup with error handling
npm run frontend:dev          # Frontend only (port 3000)
npm run backend:dev           # Backend only (port 3001)
```

### Troubleshooting
```bash
lsof -i:3000,3001            # Check what's using ports
pkill -f 'npm run dev'       # Kill all dev processes
rm -rf apps/frontend/.next/cache  # Clear Next.js cache
npm install                   # Reinstall dependencies
```

### Git Workflow
```bash
git add .                     # Stage changes
git commit -m "description"   # Save changes
git push                      # Upload to GitHub
git status                    # Check current state
```

### Building & Quality
```bash
npm run build                 # Build for production
npm run lint                  # Check code quality
npm run format                # Format code
```

---

## 🎯 Essential File Locations

### Frontend (Next.js)
- `apps/frontend/app/` - Pages and API routes
- `apps/frontend/src/components/` - Reusable UI components
- `apps/frontend/src/lib/` - Utility functions
- `apps/frontend/public/` - Static assets (images, favicon)

### Backend (NestJS)
- `apps/backend/src/` - API server code
- `apps/backend/src/controllers/` - API endpoints
- `apps/backend/src/services/` - Business logic

### Configuration
- `package.json` - Dependencies and scripts
- `render.yaml` - Deployment configuration
- `tsconfig.json` - TypeScript settings

---

## 🔧 Key Environment Variables

### Development
- `NODE_ENV=development` - Development mode
- `PORT=3000` - Frontend port
- `PORT=3001` - Backend port

### Production (Render)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_BACKEND_URL` - Backend service URL
- `MONGODB_URI` - Database connection
- `JWT_SECRET` - Authentication key

---

## 🚨 Common Error Patterns

### Port Already in Use
```
Error: listen EADDRINUSE :::3000
```
**Fix:** `lsof -ti:3000 | xargs kill -9`

### Module Not Found
```
Cannot find module './component'
```
**Fix:** Check import paths and file extensions

### TypeScript Errors
```
Property 'xyz' does not exist on type
```
**Fix:** Add proper type definitions or interfaces

### API 500 Errors in Production
**Fix:** Check environment variables and fallback logic

---

## 📱 Development URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/api/health
- **API Clients:** http://localhost:3000/api/clients

---

## 🎨 CSS Framework (Tailwind)

### Common Classes
- `bg-blue-500` - Blue background
- `text-white` - White text
- `p-4` - Padding 16px
- `m-2` - Margin 8px
- `flex` - Flexbox layout
- `grid` - Grid layout
- `rounded` - Rounded corners
- `shadow` - Drop shadow

### Responsive
- `sm:` - Small screens (640px+)
- `md:` - Medium screens (768px+)
- `lg:` - Large screens (1024px+)

---

## 🔐 Authentication Flow

1. User logs in → JWT token created
2. Token stored in browser localStorage
3. API requests include `Authorization: Bearer <token>`
4. Backend validates token for protected routes
5. Development mode has fallback to local storage

---

## 📊 API Endpoint Patterns

### RESTful Routes
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/:id` - Get specific client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

---

## 🛠️ VS Code Tasks (F1 → Tasks: Run Task)

- **Start CRM Development Server** - Full startup
- **Monitor CRM Servers** - Watch server status
- **🧹 Clean & Restart** - Clear cache and restart
- **Check Server Status** - See what's running
- **🔍 Lint All** - Code quality check

---

## 🚀 Deployment Process

1. **Local Development**
   - Code changes
   - Test locally
   - Git commit & push

2. **Render Deployment**
   - Auto-deploy on git push
   - Build process runs
   - Services restart

3. **Verify Deployment**
   - Check frontend URL
   - Test API endpoints
   - Monitor logs

---

## 💡 Pro Tips

### Development
- Use VS Code tasks instead of manual commands
- Clear cache when things act weird
- Check browser console for frontend errors
- Monitor terminal output for backend errors

### Git
- Write descriptive commit messages
- Commit frequently with small changes
- Pull before pushing to avoid conflicts

### Debugging
- Use browser DevTools Network tab for API issues
- Check VS Code Problems panel for TypeScript errors
- Use `console.log()` for quick debugging
- Check Render logs for production issues

---

*Keep this card handy during development! 📌*
