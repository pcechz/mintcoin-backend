#!/bin/bash
set -e

echo "Creating deployments structure..."

mkdir -p deployments/k8s
mkdir -p deployments/docker

########################################
# Namespaces
########################################
cat > deployments/k8s/namespaces.yaml << 'EOF'
apiVersion: v1
kind: Namespace
metadata:
  name: core

---
apiVersion: v1
kind: Namespace
metadata:
  name: realtime

---
apiVersion: v1
kind: Namespace
metadata:
  name: infra

---
apiVersion: v1
kind: Namespace
metadata:
  name: admin
EOF

########################################
# Infra: Postgres, Redis, Kafka
########################################
cat > deployments/k8s/postgres-statefulset.yaml << 'EOF'
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: infra
spec:
  serviceName: "postgres"
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16
          env:
            - name: POSTGRES_USER
              value: app
            - name: POSTGRES_PASSWORD
              value: app
            - name: POSTGRES_DB
              value: app_db
          ports:
            - containerPort: 5432
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: infra
spec:
  selector:
    app: postgres
  ports:
    - port: 5432
      targetPort: 5432
      protocol: TCP
EOF

cat > deployments/k8s/redis-deployment.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: infra
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
        - name: redis
          image: redis:7
          ports:
            - containerPort: 6379
---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: infra
spec:
  selector:
    app: redis
  ports:
    - port: 6379
      targetPort: 6379
      protocol: TCP
EOF

cat > deployments/k8s/kafka-deployment.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kafka
  namespace: infra
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kafka
  template:
    metadata:
      labels:
        app: kafka
    spec:
      containers:
        - name: kafka
          image: confluentinc/cp-kafka:7.5.0
          ports:
            - containerPort: 9092
EOF

########################################
# Ingress for API Gateway
########################################
cat > deployments/k8s/ingress.yaml << 'EOF'
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: core
spec:
  selector:
    app: api-gateway
  ports:
    - port: 80
      targetPort: 3000
      protocol: TCP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-gateway-ingress
  namespace: core
spec:
  rules:
    - host: api.yourdomain.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-gateway
                port:
                  number: 80
EOF

########################################
# Helper to generate a Deployment yaml
########################################
create_deployment() {
  local NAME=$1
  local NAMESPACE=$2

  cat > "deployments/k8s/${NAME}-deployment.yaml" << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${NAME}
  namespace: ${NAMESPACE}
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ${NAME}
  template:
    metadata:
      labels:
        app: ${NAME}
    spec:
      containers:
        - name: ${NAME}
          image: your-registry/${NAME}:latest
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: ${NAME}-config
              optional: true
            - secretRef:
                name: ${NAME}-secrets
              optional: true
EOF
}

########################################
# Core Namespace Deployments
########################################
create_deployment "api-gateway" "core"
create_deployment "auth-service" "core"
create_deployment "user-service" "core"
create_deployment "kyc-service" "core"
create_deployment "wallet-service" "core"
create_deployment "ledger-service" "core"
create_deployment "payment-service" "core"
create_deployment "gift-service" "core"
create_deployment "referral-service" "core"
create_deployment "discovery-service" "core"
create_deployment "social-graph-service" "core"
create_deployment "analytics-service" "core"

########################################
# Realtime Namespace Deployments
########################################
create_deployment "room-service" "realtime"
create_deployment "call-billing-service" "realtime"
create_deployment "chat-service" "realtime"
create_deployment "notification-service" "realtime"

########################################
# Admin Namespace Deployments
########################################
create_deployment "admin-service" "admin"
create_deployment "moderation-service" "admin"
create_deployment "fraud-service" "admin"

########################################
# Dockerfiles for all services
########################################
create_dockerfile() {
  local NAME=$1

  cat > "deployments/docker/${NAME}.Dockerfile" << EOF
FROM node:20-alpine

WORKDIR /app

# Copy the entire monorepo (adjust if you want slimmer images)
COPY . .

# Install dependencies (you can switch to pnpm/yarn if that's your choice)
RUN npm install --omit=dev

# Build only this app (define script in package.json, e.g. "build:${NAME}")
# Option 1: nest build directly
# RUN npx nest build ${NAME}
# Option 2: via npm script:
# RUN npm run build:${NAME}
RUN npm run build:${NAME}

CMD ["node", "dist/apps/${NAME}/main.js"]
EOF
}

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

for SVC in "${SERVICES[@]}"; do
  create_dockerfile "${SVC}"
done

echo "Deployments structure created for ALL services under deployments/k8s and deployments/docker ✅"
