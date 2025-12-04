# Mintcoin Backend - Quick Start

Get up and running in 5 minutes.

## Step 1: Install Dependencies

```bash
yarn install
```

## Step 2: Start Infrastructure

```bash
yarn docker:up
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Kafka + Zookeeper (port 9092)
- Elasticsearch (port 9200)
- MinIO (port 9000)
- Admin UIs (Kafka UI: 8080, Redis Commander: 8081, PgAdmin: 5050)

Wait ~30 seconds for all services to be healthy.

## Step 3: Initialize Kafka Topics

```bash
yarn kafka:topics
```

## Step 4: Start a Service

```bash
# Start auth service in dev mode
yarn start:auth-service:dev
```

The service will start on port 3000 by default.

## Step 5: Test the Service

```bash
curl http://localhost:3000
```

## Common Commands

```bash
# Start infrastructure
yarn docker:up

# Stop infrastructure
yarn docker:down

# View infrastructure logs
yarn docker:logs

# Create Kafka topics
yarn kafka:topics

# Start any service in dev mode (with hot reload)
yarn start:[service-name]:dev

# Example services:
yarn start:auth-service:dev
yarn start:user-service:dev
yarn start:wallet-service:dev
yarn start:api-gateway:dev
```

## Next Steps

1. Read `LOCAL_DEV_SETUP.md` for detailed documentation
2. Check `BackendPRD.rtf` (in parent directory) for business requirements
3. Start implementing database entities
4. Build out the auth flow
5. Connect services via Kafka events

## Troubleshooting

**Services won't start:**
```bash
docker-compose ps  # Check status
docker-compose logs -f postgres  # Check logs
```

**Port conflicts:**
Edit `docker-compose.yml` and change port mappings.

**Clean slate:**
```bash
yarn docker:down
docker volume prune  # Remove all volumes (data will be lost)
yarn docker:up
```
