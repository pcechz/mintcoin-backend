# MintCoin Services Management Guide

## Overview

This document explains how to manage and run the MintCoin microservices in a professional manner. Each service runs on its own dedicated port, and you have multiple ways to orchestrate them.

---

## 📊 Service Port Allocation

All services have dedicated ports defined in `.env`:

### Core Services (3001-3003)
- **Auth Service**: Port 3001 - Authentication, OTP, Sessions
- **User Service**: Port 3002 - User profiles, Referrals
- **KYC Service**: Port 3003 - Identity verification

### Financial Services (3004-3006)
- **Wallet Service**: Port 3004 - Dual wallet system (Main + Earnings)
- **Ledger Service**: Port 3005 - Transaction recording
- **Payment Service**: Port 3006 - Payment gateway integration

### Communication Services (3007-3009)
- **Room Service**: Port 3007 - Chat-based group rooms
- **Call Billing Service**: Port 3008 - Audio/video call billing
- **Chat Service**: Port 3009 - 1-on-1 direct messaging

### Feature Services (3010-3013)
- **Gift Service**: Port 3010 - Virtual gifts
- **Referral Service**: Port 3011 - Referral system
- **Discovery Service**: Port 3012 - Content discovery
- **Social Graph Service**: Port 3013 - Followers, following

### Platform Services (3014-3018)
- **Notification Service**: Port 3014 - Push notifications
- **Moderation Service**: Port 3015 - Content moderation
- **Fraud Service**: Port 3016 - Fraud detection
- **Admin Service**: Port 3017 - Admin dashboard
- **Analytics Service**: Port 3018 - Analytics and reporting

---

## 🚀 Running Services

### Method 1: Using npm scripts (Recommended for Development)

Run services by group for better organization:

```bash
# Run core services (Auth + User)
yarn services:core

# Run financial services (KYC + Wallet + Ledger + Payment)
yarn services:financial

# Run communication services (Room + Call + Chat)
yarn services:communication

# Run feature services (Gift + Referral + Discovery + Social)
yarn services:feature

# Run platform services (Notification + Moderation + Fraud + Admin + Analytics)
yarn services:platform

# Run ALL services (18 services simultaneously)
yarn services:all
```

**Features:**
- Color-coded output for easy identification
- Runs services concurrently with proper labeling
- Automatically handles restarts on file changes
- Shows output from all services in one terminal

### Method 2: Using the Service Manager Script (Recommended)

For professional service lifecycle management with full control:

```bash
# Show all available services and ports
./scripts/manage-services.sh list

# ===== START SERVICES =====
# Run core services
./scripts/manage-services.sh core

# Run financial services
./scripts/manage-services.sh financial

# Run communication services
./scripts/manage-services.sh communication

# Run feature services
./scripts/manage-services.sh feature

# Run platform services
./scripts/manage-services.sh platform

# Run all services
./scripts/manage-services.sh all

# ===== STOP SERVICES =====
# Stop service groups
./scripts/manage-services.sh stop core
./scripts/manage-services.sh stop financial
./scripts/manage-services.sh stop all

# Stop individual service by port number
./scripts/manage-services.sh stop 3001
./scripts/manage-services.sh stop 3002

# ===== MONITOR SERVICES =====
# Check which services are running
./scripts/manage-services.sh status

# Check health of running services
./scripts/manage-services.sh health

# Detect services with issues
./scripts/manage-services.sh issues

# Show help
./scripts/manage-services.sh help
```

**Features:**
- Beautiful colored output with banners
- Service information display before starting
- **Stop services by group or port number**
- **Real-time status checking with PIDs**
- **Health monitoring with HTTP checks**
- **Issue detection for problematic services**
- Easy-to-use command-line interface
- Port mapping visualization

### Method 3: Individual Service Startup

For focused development on a single service:

```bash
# Start a single service
yarn start:auth-service:dev
yarn start:user-service:dev
yarn start:kyc-service:dev
# ... etc
```

---

## 🛠️ Development Workflow Recommendations

### For Backend Developers

**Phase 1: Core Development**
```bash
# Start only the services you're working on
yarn services:core  # Auth + User
```

**Phase 2: Integration Testing**
```bash
# Start related service groups
yarn services:core
yarn services:financial  # In a new terminal
```

**Phase 3: Full System Testing**
```bash
# Run all services
yarn services:all
```

### Service Dependencies

Some services depend on others. Recommended startup order:

1. **Core Services First** (Auth + User)
2. **Financial Services** (KYC + Wallet + Ledger + Payment)
3. **Communication Services** (Room + Call + Chat)
4. **Feature Services** (Gift + Referral + Discovery + Social)
5. **Platform Services** (Notification + Moderation + Fraud + Admin + Analytics)

---

## 📝 Service Configuration

### Port Configuration

All ports are defined in `.env`:

```env
# Core Services
AUTH_SERVICE_PORT=3001
USER_SERVICE_PORT=3002
KYC_SERVICE_PORT=3003

# Financial Services
WALLET_SERVICE_PORT=3004
LEDGER_SERVICE_PORT=3005
PAYMENT_SERVICE_PORT=3006

# ... etc
```

### Service Bootstrap Features

Each service's `main.ts` includes:
- **Environment-based port configuration**
- **CORS enabled** for frontend communication
- **Global validation pipes** for DTO validation
- **Startup logging** with service info
- **Graceful error handling**

Example service startup log:
```
🚀 Auth Service is running on: http://localhost:3001
📍 Environment: development
🔐 Endpoints: http://localhost:3001/auth/*
```

---

## 🔧 Troubleshooting

### Port Already in Use

If you see `EADDRINUSE` error:

```bash
# Find process using the port
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or use the manage-services script which handles this better
```

### Service Won't Start

1. Check if dependencies are installed:
   ```bash
   yarn install
   ```

2. Check if database is running:
   ```bash
   docker ps | grep postgres
   ```

3. Check if Kafka is running:
   ```bash
   docker ps | grep kafka
   ```

4. Check environment variables:
   ```bash
   cat .env | grep PORT
   ```

### Multiple Services Output Overwhelming

Use individual service startup for focused development:

```bash
# Terminal 1
yarn start:auth-service:dev

# Terminal 2
yarn start:user-service:dev
```

Or filter output by service name when using `concurrently`.

---

## 📊 Service Monitoring & Management

### Quick Status Check

```bash
# Show all services with their status (running/stopped)
./scripts/manage-services.sh status
```

**Output includes:**
- Service name and port
- Process ID (PID) for running services
- Summary: Running/Stopped/Total counts

### Health Monitoring

```bash
# Check health of all running services
./scripts/manage-services.sh health
```

**Health check performs:**
- HTTP request to each service endpoint
- Reports: Healthy (HTTP 200/404), Unhealthy, or Not Running
- Summary: Healthy/Unhealthy/Stopped counts

### Issue Detection

```bash
# Detect services with problems
./scripts/manage-services.sh issues
```

**Detects:**
- Services running but not responding to HTTP requests
- Services with connection problems
- Services that crashed but port is still in use

### Stop Services

```bash
# Stop specific service by port
./scripts/manage-services.sh stop 3001

# Stop service group
./scripts/manage-services.sh stop core
./scripts/manage-services.sh stop financial

# Stop all services
./scripts/manage-services.sh stop all
```

**Stop features:**
- Graceful shutdown (SIGTERM) with automatic force kill (SIGKILL) if needed
- Works with service groups or individual ports
- Shows warnings for services already stopped

### Manual Process Management

For advanced users, you can still use system commands:

```bash
# List all Node.js processes
ps aux | grep "nest start"

# Check specific ports
lsof -i :3001  # Auth Service
lsof -i :3002  # User Service

# Manually kill a process
kill -9 <PID>
```

---

## 🎯 Best Practices

### 1. Start with Core Services

Always start with Auth and User services as they're dependencies for others:

```bash
yarn services:core
```

### 2. Use Service Groups

Don't run all services unless necessary. Use logical groups:

```bash
# For user management features
yarn services:core

# For payment features
yarn services:core
yarn services:financial  # In new terminal
```

### 3. Environment Variables

Keep `.env` updated with all port configurations. Never hardcode ports in service code.

### 4. Graceful Shutdown

Always use `Ctrl+C` to stop services gracefully. This ensures:
- Database connections close properly
- Kafka consumers disconnect cleanly
- Resources are freed

### 5. Log Management

When running multiple services:
- Use the service manager for better visualization
- Redirect logs to files for production
- Use logging levels appropriately

---

## 🚦 Service Status Quick Reference

| Service | Port | Status | Dependencies |
|---------|------|--------|--------------|
| Auth Service | 3001 | ✅ Ready | PostgreSQL, Redis, Kafka |
| User Service | 3002 | ✅ Ready | PostgreSQL, Kafka, Auth Service |
| KYC Service | 3003 | ⏳ Pending | PostgreSQL, Kafka, User Service |
| Wallet Service | 3004 | ⏳ Pending | PostgreSQL, Kafka, User Service |
| Ledger Service | 3005 | ⏳ Pending | PostgreSQL, Kafka, Wallet Service |
| Payment Service | 3006 | ⏳ Pending | PostgreSQL, Kafka, Wallet Service |
| Room Service | 3007 | ⏳ Pending | PostgreSQL, Kafka, User Service |
| Call Billing Service | 3008 | ⏳ Pending | PostgreSQL, Kafka, Wallet Service |
| Chat Service | 3009 | ⏳ Pending | PostgreSQL, Kafka, User Service |
| Gift Service | 3010 | ⏳ Pending | PostgreSQL, Kafka, Wallet Service |
| Referral Service | 3011 | ⏳ Pending | PostgreSQL, Kafka, User Service |
| Discovery Service | 3012 | ⏳ Pending | PostgreSQL, Elasticsearch |
| Social Graph Service | 3013 | ⏳ Pending | PostgreSQL, Kafka |
| Notification Service | 3014 | ⏳ Pending | Kafka, Push Services |
| Moderation Service | 3015 | ⏳ Pending | PostgreSQL, Kafka |
| Fraud Service | 3016 | ⏳ Pending | PostgreSQL, Kafka |
| Admin Service | 3017 | ⏳ Pending | PostgreSQL, Kafka |
| Analytics Service | 3018 | ⏳ Pending | PostgreSQL, Kafka |

---

## 📚 Additional Resources

- [Architecture Documentation](./IMPLEMENTATION_PROGRESS.md)
- [Shared Libraries Guide](./SHARED_LIBRARIES_GUIDE.md)
- [Local Development Setup](./LOCAL_DEV_SETUP.md)
- [Auth & User Implementation](./AUTH_AND_USER_SERVICES_IMPLEMENTATION.md)

---

## 🎓 Examples

### Example 1: Starting Development Environment

```bash
# Terminal 1: Start infrastructure
yarn docker:up

# Terminal 2: Wait for infrastructure, then start core services
./scripts/manage-services.sh core

# Both Auth (3001) and User (3002) services are now running

# Check status
./scripts/manage-services.sh status

# When done, stop services
./scripts/manage-services.sh stop core
```

### Example 2: Testing Payment Integration

```bash
# Terminal 1: Start core services
./scripts/manage-services.sh core

# Terminal 2: Start financial services
./scripts/manage-services.sh financial

# Check all service health
./scripts/manage-services.sh health

# When done, stop all
./scripts/manage-services.sh stop all
```

### Example 3: Full System Demo

```bash
# Start all services
./scripts/manage-services.sh all

# Check status to see all running services
./scripts/manage-services.sh status

# Visit different service endpoints:
# http://localhost:3001/auth    - Auth Service
# http://localhost:3002/users   - User Service
# http://localhost:3004/wallet  - Wallet Service
# ... etc

# Stop all when done
./scripts/manage-services.sh stop all
```

### Example 4: Debugging a Single Service

```bash
# Start just one service
yarn start:auth-service:dev

# In another terminal, check its status
./scripts/manage-services.sh status

# Stop specific service by port
./scripts/manage-services.sh stop 3001
```

### Example 5: Monitoring Production Services

```bash
# Check which services are running
./scripts/manage-services.sh status

# Check health of all services
./scripts/manage-services.sh health

# Detect any issues
./scripts/manage-services.sh issues

# If issues found, restart the problematic service
./scripts/manage-services.sh stop 3005  # Stop ledger service
yarn start:ledger-service:dev           # Restart it
```

---

**Last Updated:** 2025-12-04
**Services Implemented:** 2/18 (Auth, User)
**Services Pending:** 16/18
