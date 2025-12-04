#!/bin/bash
set -e

mkdir -p deployments/k8s

# Same mapping as deployments: which namespace each lives in.
core_services=(
  "api-gateway"
  "auth-service"
  "user-service"
  "kyc-service"
  "wallet-service"
  "ledger-service"
  "payment-service"
  "gift-service"
  "referral-service"
  "discovery-service"
  "social-graph-service"
  "analytics-service"
)

realtime_services=(
  "room-service"
  "call-billing-service"
  "chat-service"
  "notification-service"
)

admin_services=(
  "admin-service"
  "moderation-service"
  "fraud-service"
)

create_service_yaml() {
  local NAME=$1
  local NAMESPACE=$2

  cat > "deployments/k8s/${NAME}-service.yaml" << EOF
apiVersion: v1
kind: Service
metadata:
  name: ${NAME}
  namespace: ${NAMESPACE}
spec:
  selector:
    app: ${NAME}
  ports:
    - port: 3000
      targetPort: 3000
      protocol: TCP
  type: ClusterIP
EOF
}

echo "Generating Service YAMLs for core services..."
for SVC in "${core_services[@]}"; do
  create_service_yaml "${SVC}" "core"
done

echo "Generating Service YAMLs for realtime services..."
for SVC in "${realtime_services[@]}"; do
  create_service_yaml "${SVC}" "realtime"
done

echo "Generating Service YAMLs for admin services..."
for SVC in "${admin_services[@]}"; do
  create_service_yaml "${SVC}" "admin"
done

echo "All Service YAMLs created under deployments/k8s ✅"
