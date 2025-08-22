# CRM Development Server Management

## 🚀 Quick Start Commands

### Recommended (Robust startup with error handling):
```bash
npm run dev:robust
```

### Monitor servers and auto-restart on crashes:
```bash
npm run dev:monitor
```

### Check server status:
```bash
npm run dev:status
```

### Stop all servers:
```bash
npm run dev:stop
```

## 🔧 Manual Commands

### Standard development (original):
```bash
npm run dev
```

### Individual servers:
```bash
npm run frontend:dev  # Frontend only (port 3000)
npm run backend:dev   # Backend only (port 3001)
```

## 🛠️ VS Code Tasks

Access via **Terminal > Run Task...**:

- **Start CRM Development Server** - Robust startup with error handling
- **Monitor CRM Servers** - Auto-restart monitoring
- **Stop All CRM Servers** - Clean shutdown
- **Check Server Status** - View port and process status
- **Frontend Only** - Start only frontend
- **Backend Only** - Start only backend

## 🚨 Troubleshooting

### Common Issues and Solutions:

#### 1. **Port Already in Use**
```bash
# Kill processes on ports 3000 and 3001
npm run dev:stop
# Wait a few seconds, then restart
npm run dev:robust
```

#### 2. **Servers Keep Crashing**
```bash
# Use the monitoring script
npm run dev:monitor
```

#### 3. **Manual Port Cleanup**
```bash
# Find what's using the ports
lsof -i:3000
lsof -i:3001

# Kill specific processes
kill -9 <PID>

# Nuclear option (kills everything)
sudo lsof -ti:3000,3001 | xargs kill -9
```

#### 4. **Environment Issues**
```bash
# Reinstall dependencies
npm run clean
npm install

# Check environment file
ls -la .env
```

### Exit Codes Meaning:
- **130**: Interrupted (Ctrl+C)
- **143**: Terminated (SIGTERM)
- **1**: Error/failure
- **0**: Normal exit

## 📊 Server Monitoring

The monitor script checks every 10 seconds and will:
- ✅ Restart crashed servers automatically
- 🔄 Reset restart counter on successful runs
- 🛑 Stop after 5 failed restart attempts
- 📝 Log all activities with timestamps

## 🔒 Best Practices

1. **Always use the robust startup**: `npm run dev:robust`
2. **Run monitoring for long sessions**: `npm run dev:monitor`
3. **Check status when troubleshooting**: `npm run dev:status`
4. **Clean shutdown**: `npm run dev:stop` before restarting
5. **Don't manually kill unless necessary**

## 🌐 URLs

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/health
