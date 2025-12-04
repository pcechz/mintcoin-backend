#!/bin/bash
set -e

SERVICES=(
  "api-gateway"
  "auth-service"
  "user-service"
  "kyc-service"
  "wallet-service"
  "ledger-service"
  "payment-service"
  "room-service"
  "call-billing-service"
  "chat-service"
  "gift-service"
  "referral-service"
  "discovery-service"
  "social-graph-service"
  "notification-service"
  "moderation-service"
  "fraud-service"
  "admin-service"
  "analytics-service"
)

create_structure_for_service () {
  NAME=$1
  ROOT="apps/$NAME/src"

  if [ ! -d "$ROOT" ]; then
    echo "Skipping $NAME (no src/ found at $ROOT)"
    return
  fi

  echo "----------------------------------------"
  echo "Shaping DDD structure for: $NAME"
  echo "----------------------------------------"

  mkdir -p "$ROOT/config"
  mkdir -p "$ROOT/domain/entities"
  mkdir -p "$ROOT/domain/enums"
  mkdir -p "$ROOT/domain/value-objects"
  mkdir -p "$ROOT/domain/services"

  mkdir -p "$ROOT/application/dto"
  mkdir -p "$ROOT/application/services"
  mkdir -p "$ROOT/application/listeners"

  mkdir -p "$ROOT/infrastructure/persistence"
  mkdir -p "$ROOT/infrastructure/messaging"
  mkdir -p "$ROOT/infrastructure/http"

  mkdir -p "$ROOT/interfaces/rest"
  mkdir -p "$ROOT/interfaces/graphql"

  # Optionally: move default controller/service into interfaces/application
  if [ -f "$ROOT/app.controller.ts" ]; then
    mv "$ROOT/app.controller.ts" "$ROOT/interfaces/rest/app.controller.ts"
  fi

  if [ -f "$ROOT/app.service.ts" ]; then
    mv "$ROOT/app.service.ts" "$ROOT/application/services/app.service.ts"
  fi

  echo "Done: $NAME"
  echo
}

for S in "${SERVICES[@]}"; do
  create_structure_for_service "$S"
done

echo "========================================"
echo "All services reshaped to DDD layout ✅"
echo "========================================"
