# Render Deployment Guide

This document provides an end-to-end playbook for deploying the Remodely CRM monorepo (NestJS backend + Next.js frontend) to Render.

## 1. Architecture Choices

Recommended: **Two Web Services**
- Backend API (NestJS) – apps/backend
- Frontend App (Next.js SSR) – apps/frontend

Benefits: Independent scaling, clearer env separation, simpler diagnostics, real-time features unaffected by frontend traffic spikes.

Alternative: Backend on Render + Frontend on Vercel (optional) – skip if you want simplicity first.

## 2. Prerequisites
- GitHub repo connected to Render.
- MongoDB Atlas cluster + connection string.
- Provider API keys (OpenAI, SendGrid, Stripe, Twilio, Cloudinary, etc.).
- Google OAuth configured with production redirect URL.

## 3. Backend Service Setup
Service Type: Web Service
Root Directory: `apps/backend`
Build Command:
```
npm install --workspace-root && npm run build
```
Start Command:
```
npm run start:render
```
Health Check Path: `/health`
Region: Closest to majority of users (e.g. US East)
Instance Plan: Start with Starter / Shared; upgrade if CPU or memory bound.

### Backend Environment Variables
| Variable | Required | Notes |
|----------|----------|-------|
| PORT | auto (Render) | Nest listens on `process.env.PORT`. |
| MONGODB_URI | Yes | Mongo Atlas SRV URI. |
| JWT_SECRET | Yes | Strong random string. |
| FRONTEND_URL | Yes | `https://<frontend>.onrender.com` |
| CORS_ORIGINS | Yes | Same as FRONTEND_URL (comma separated if multiple). |
| NEXT_PUBLIC_API_URL | No (avoid) | Keep OUT of backend unless reused in templates. |
| OPENAI_API_KEY | Optional | Only if AI features enabled. |
| GEMINI_API_KEY | Optional | Alternative AI provider. |
| STRIPE_SECRET_KEY | Optional | Billing features. |
| STRIPE_WEBHOOK_SECRET | Optional | After creating webhook endpoint. |
| SENDGRID_API_KEY | Optional | Email delivery. |
| TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN | Optional | SMS/voice. |
| CLOUDINARY_* | Optional | Asset handling. |
| ELEVENLABS_* | Optional | Voice agent. |
| ENABLE_*_NOTIFICATIONS | Optional | Toggle features. |

Remove localhost origins for production once stable.

## 4. Frontend Service Setup
Service Type: Web Service (not Static Site because SSR + API routes).
Root Directory: `apps/frontend`
Build Command:
```
npm install --workspace-root && npm run build
```
Start Command:
```
npm run start:render
```
Auto-Deploy: Yes (main)

### Frontend Environment Variables
| Variable | Required | Notes |
|----------|----------|-------|
| NEXT_PUBLIC_API_URL | Yes | `https://<backend>.onrender.com/api` |
| NEXT_PUBLIC_FRONTEND_URL | Yes | `https://<frontend>.onrender.com` |
| GOOGLE_CLIENT_ID | If using OAuth | Must match Google console. |
| GOOGLE_REDIRECT_URI | If using OAuth | `https://<frontend>.onrender.com/auth/google/callback` |

Never expose secret keys here.

## 5. Google OAuth Configuration
In Google Cloud Console:
- Authorized JavaScript origins: `https://<frontend>.onrender.com`
- Authorized redirect URIs: `https://<frontend>.onrender.com/auth/google/callback`
Update env: `GOOGLE_REDIRECT_URI` to match.

## 6. Swagger & Health
- Swagger: `https://<backend>.onrender.com/api/docs`
- Health: `https://<backend>.onrender.com/health` -> `{ status: 'ok', uptime: <seconds> }`
Use `/health` for Render health checks (fast, minimal dependencies).

## 7. Deployment Order
1. Deploy Backend (fails initially if Mongo not reachable → fix MONGODB_URI).
2. Verify /health and /api/docs.
3. Deploy Frontend with NEXT_PUBLIC_API_URL pointing to backend.
4. Test registration/login flow.

## 8. Smoke Test Script (Optional)
Create a quick script locally before pushing:
```
#!/usr/bin/env bash
set -e
API_BASE="https://<backend>.onrender.com/api"
curl -sf ${API_BASE}/docs >/dev/null || echo "Swagger accessible"
curl -sf https://<backend>.onrender.com/health || echo "Health check failed"
```

## 9. Logging & Monitoring
Render dashboard → Logs tab for each service.
Use Nest Logger (already present) instead of console.log for structured output.
Add external monitoring (Pingdom, UptimeRobot) hitting `/health` for uptime SLA.

## 10. Scaling & Performance
- Upgrade instance if sustained CPU > 70%.
- Enable autoscaling (paid tiers) once traffic is predictable.
- Consider caching frequently-read data (Redis add-on) later.

## 11. WebSockets / Realtime
If you enable Socket.IO via the same HTTP server (recommended), no extra service needed. Ensure CORS in backend allows FRONTEND_URL.

## 12. Security Hardening
- Rotate JWT_SECRET on compromise (force re-login).
- Restrict MONGODB_URI IP access to Render egress (or use VPC Peering if available).
- Enable 2FA for provider dashboards.
- Set strict CORS list (no wildcards in production).
- Use HTTPS-only cookies if you move auth tokens to cookies later.

## 13. Future Enhancements
- Add staging environment (staging branch → staging services).
- Add CI lint/type/test pipeline before Render deploy.
- Add Sentry or Logtail for error aggregation.
- Add CDN (Cloudflare) in front of frontend for caching static assets.

## 14. Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| 404 from frontend API calls | Wrong NEXT_PUBLIC_API_URL | Set correct backend URL + redeploy. |
| CORS error in browser | FRONTEND_URL/CORS_ORIGINS mismatch | Ensure exact https origin in both. |
| OAuth redirect mismatch | Google console URIs wrong | Update console + env, redeploy. |
| Health check failing | Build error or DB connect hang | Check logs; ensure DB reachable quickly. |
| High cold start latency | Instance scaled to zero | Set min instance = 1. |

## 15. Quick Copy Values Template
Backend env (example):
```
PORT=10000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/crm
JWT_SECRET=replace-me-long-random
FRONTEND_URL=https://remodely-frontend.onrender.com
CORS_ORIGINS=https://remodely-frontend.onrender.com
OPENAI_API_KEY=sk-...
```

Frontend env (example):
```
NEXT_PUBLIC_API_URL=https://remodely-backend.onrender.com/api
NEXT_PUBLIC_FRONTEND_URL=https://remodely-frontend.onrender.com
GOOGLE_CLIENT_ID=...
GOOGLE_REDIRECT_URI=https://remodely-frontend.onrender.com/auth/google/callback
```

---
Deployment ready. Proceed with creating the services in Render dashboard using this reference.
