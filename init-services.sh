#!/bin/bash
set -e

# This script must be run from the root of a NestJS workspace
# (where nest-cli.json and package.json are).

create_service () {
  NAME=$1
  echo "----------------------------------------"
  echo "Creating Nest app: $NAME"
  echo "----------------------------------------"

  # Nest v10: generate app inside apps/ (monorepo)
  npx nest generate app "$NAME"

  echo "App created: apps/$NAME"
  echo
}

echo "========================================"
echo "Generating all services in apps/..."
echo "========================================"

###############################
### Gateway
###############################
create_service "api-gateway"

###############################
### Core Auth & Identity
###############################
create_service "auth-service"
create_service "user-service"
create_service "kyc-service"

###############################
### Money Layer (Wallet, Ledger, Payment)
###############################
create_service "wallet-service"
create_service "ledger-service"
create_service "payment-service"

###############################
### Real-time Services
###############################
create_service "room-service"
create_service "call-billing-service"
create_service "chat-service"

###############################
### Monetization Services
###############################
create_service "gift-service"
create_service "referral-service"
create_service "discovery-service"
create_service "social-graph-service"

###############################
### Platform Services
###############################
create_service "notification-service"
create_service "moderation-service"
create_service "fraud-service"
create_service "admin-service"

###############################
### Optional Analytics Service
###############################
create_service "analytics-service"

echo "========================================"
echo "All apps generated under apps/ ✅"
echo "========================================"
