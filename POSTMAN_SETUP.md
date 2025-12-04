# MintCoin API - Postman Setup Guide

## Overview
This guide will help you set up and use the MintCoin API collection in Postman for testing and development.

## Files Included
- `MintCoin-API-Collection.postman_collection.json` - Complete API collection with all endpoints
- `MintCoin-Local.postman_environment.json` - Environment variables for local development

## Import Instructions

### 1. Import Collection
1. Open Postman
2. Click **Import** button (top left)
3. Select the file: `MintCoin-API-Collection.postman_collection.json`
4. Click **Import**

### 2. Import Environment
1. Click the **Environments** tab (left sidebar)
2. Click **Import**
3. Select the file: `MintCoin-Local.postman_environment.json`
4. Click **Import**
5. Select **MintCoin - Local Development** from the environment dropdown (top right)

## Quick Start Guide

### Step 1: Start Required Services
Make sure your backend services are running:

```bash
# Start infrastructure (PostgreSQL, Redis, Kafka, etc.)
docker-compose up -d

# Start auth service
yarn start:auth-service:dev

# Start user service
yarn start:user-service:dev

# Start API gateway (optional)
cd apps/api-gateway
yarn start:dev
```

### Step 2: Test Authentication Flow

#### 2.1 Send OTP
1. Open **Authentication** → **Send OTP (Phone)**
2. Update the phone number in the request body
3. Click **Send**
4. Check console logs for the OTP code (in development, OTP is logged)

#### 2.2 Verify OTP
1. Open **Authentication** → **Verify OTP (Phone)**
2. Update phone number and OTP code from previous step
3. Click **Send**
4. Verify you get `{verified: true}` response

#### 2.3 Create User
1. Open **Users** → **Create User**
2. Update user details in request body
3. Click **Send**
4. The `userId` will be automatically saved to environment variables

#### 2.4 Login
1. Open **Authentication** → **Login**
2. Click **Send**
3. Tokens will be automatically saved to environment variables
4. All subsequent requests will use these tokens automatically

### Step 3: Test User Endpoints

With authentication complete, you can now test:
- **Get My Profile** - View your full profile
- **Update My Profile** - Modify profile information
- **Update Username** - Change your username
- **Get User by ID** - View public profiles

## Collection Structure

### 1. **Authentication** (Fully Implemented)
- Send OTP (Phone/Email)
- Verify OTP
- Login
- Refresh Token
- Get Active Sessions
- Logout
- Revoke All Sessions

### 2. **Users** (Fully Implemented)
- Create User
- Get My Profile
- Update My Profile
- Update Username
- Get User by ID
- Get User by Username

### 3. **Wallet** (Placeholder - To Be Implemented)
- Get Wallet Balance
- Get Transaction History

### 4. **Payments** (Placeholder - To Be Implemented)
- Purchase Coins
- Withdraw Funds
- Verify Payment

### 5. **Rooms** (Placeholder - To Be Implemented)
- Create Room
- Get Active Rooms
- Join Room
- Leave Room

### 6. **Gifts** (Placeholder - To Be Implemented)
- Get Gift Catalog
- Send Gift
- Get Gift History

### 7. **Social Graph** (Placeholder - To Be Implemented)
- Follow User
- Unfollow User
- Get Followers
- Get Following

### 8. **Discovery** (Placeholder - To Be Implemented)
- Search Users
- Get Suggested Users
- Get Trending Creators

### 9. **KYC** (Placeholder - To Be Implemented)
- Submit KYC Information
- Get KYC Status

### 10. **Referrals** (Placeholder - To Be Implemented)
- Get My Referral Code
- Get Referral Stats
- Get Referred Users

### 11. **Notifications** (Placeholder - To Be Implemented)
- Get Notifications
- Mark as Read
- Mark All as Read

### 12. **Admin** (Placeholder - To Be Implemented)
- Get Dashboard Stats
- Manage Users
- Suspend User

## Environment Variables

The collection uses the following variables that are automatically managed:

### URLs
- `baseUrl` - API Gateway base URL (http://localhost:3000/api/v1)
- `authServiceUrl` - Auth Service URL (http://localhost:3001)
- `userServiceUrl` - User Service URL (http://localhost:3002)

### Authentication
- `accessToken` - JWT access token (auto-saved on login)
- `refreshToken` - JWT refresh token (auto-saved on login)
- `sessionId` - Current session ID (auto-saved on login)
- `userId` - Current user ID (auto-saved on user creation/login)
- `deviceId` - Device identifier for testing

## Auto-Save Features

The collection includes scripts that automatically save important values:

### Login Request
- Saves `accessToken` to environment
- Saves `refreshToken` to environment
- Saves `sessionId` to environment
- Saves `userId` to environment

### Create User Request
- Saves `userId` to environment

### Refresh Token Request
- Updates `accessToken` in environment
- Updates `refreshToken` in environment

## Authentication

Most endpoints require authentication via Bearer token. The collection is configured to automatically use the `accessToken` variable for authenticated requests.

### Manual Token Setup (if needed)
1. Get your access token from the login response
2. Go to Environment variables
3. Update the `accessToken` value
4. All authenticated requests will now include this token

## Testing Tips

### 1. Test Phone Numbers
Use Nigerian phone numbers in E.164 format:
- Example: `+2348012345678`
- Format: `+234` + 10-digit number

### 2. OTP Codes in Development
In development mode, OTP codes are logged to the console. Check the auth-service logs:
```
OTP for +2348012345678: 123456
```

### 3. Device ID
The collection uses a default `deviceId` of `postman-test-device`. You can change this in the environment variables if you want to test multiple devices.

### 4. Sequential Testing
For best results, test endpoints in this order:
1. Send OTP
2. Verify OTP
3. Create User (if new user)
4. Login
5. Test other authenticated endpoints

## Service Ports Reference

- **API Gateway**: `http://localhost:3000` (Swagger: http://localhost:3000/api/docs)
- **Auth Service**: `http://localhost:3001`
- **User Service**: `http://localhost:3002`
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **Kafka**: `localhost:9092`
- **Kafka UI**: `http://localhost:8080`
- **Elasticsearch**: `http://localhost:9200`
- **MinIO**: `http://localhost:9000` (Console: http://localhost:9001)
- **Redis Commander**: `http://localhost:8081`
- **PgAdmin**: `http://localhost:5050`

## Swagger Documentation

Once the API Gateway is running, you can also use the interactive Swagger documentation:

**URL**: http://localhost:3000/api/docs

Features:
- Interactive API testing
- Schema documentation
- Try out endpoints directly
- Bearer token authentication support

## Troubleshooting

### Issue: "Unauthorized" errors
**Solution**:
1. Make sure you've logged in successfully
2. Check that `accessToken` is set in environment variables
3. Token may have expired - try refreshing or logging in again

### Issue: "Cannot connect to service"
**Solution**:
1. Verify the service is running: `yarn start:auth-service:dev`
2. Check the correct port in environment variables
3. Ensure Docker containers are running for infrastructure

### Issue: "OTP verification failed"
**Solution**:
1. Check auth-service console logs for the actual OTP code
2. Make sure you're using the same phone/email used to request OTP
3. OTP expires after 5 minutes - request a new one if expired

### Issue: "Username already exists"
**Solution**:
1. Try a different username
2. Or check database to see if user already exists
3. Username must be unique across the platform

## Next Steps

### For Developers
1. Implement remaining microservices following the auth/user service patterns
2. Add new endpoints to the collection as you build them
3. Update environment variables as new services are added

### For Testers
1. Test complete authentication flows
2. Verify error handling with invalid inputs
3. Test concurrent sessions with different device IDs
4. Document any bugs or unexpected behavior

## Support

For issues or questions:
- Check service logs: `docker-compose logs [service-name]`
- Review documentation in project README files
- Check Swagger docs for endpoint details

## Additional Resources

- **Project Documentation**: See `README.md` in project root
- **Architecture**: See `ARCHITECTURE_CLARIFICATIONS.md`
- **Setup Guide**: See `LOCAL_DEV_SETUP.md`
- **Service Management**: See `SERVICES_MANAGEMENT.md`
