# Mintcoin Backend - Local Development Setup

This guide will help you set up the complete local development environment for the Mintcoin microservices platform.

## Prerequisites

- Node.js 20+ and Yarn
- Docker and Docker Compose
- Git

## Quick Start

### 1. Install Dependencies

```bash
yarn install
```

### 2. Start Infrastructure Services

Start all infrastructure services (PostgreSQL, Redis, Kafka, Elasticsearch, MinIO):

```bash
docker-compose up -d
```

**Services will be available at:**
- PostgreSQL: `localhost:5432` (user: `app`, password: `app`)
- Redis: `localhost:6379`
- Kafka: `localhost:9092`
- Elasticsearch: `localhost:9200`
- MinIO (S3): `localhost:9000` (Console: `localhost:9001`)
- Kafka UI: `http://localhost:8080`
- Redis Commander: `http://localhost:8081`
- PgAdmin: `http://localhost:5050` (email: `admin@mintcoin.com`, password: `admin`)

### 3. Initialize Kafka Topics

```bash
./scripts/create-kafka-topics.sh
```

### 4. Run Database Migrations

```bash
yarn migration:run
```

### 5. Start a Service

Start individual services in development mode:

```bash
# Start API Gateway
yarn start:api-gateway:dev

# Start Auth Service
yarn start:auth-service:dev

# Start User Service
yarn start:user-service:dev

# ... etc
```

## Project Structure

```
backend/
├── apps/                    # Microservices
│   ├── api-gateway/
│   ├── auth-service/
│   ├── user-service/
│   ├── wallet-service/
│   └── ... (19 services total)
├── libs/                    # Shared libraries
│   ├── common/             # Utilities, constants
│   ├── config/             # Configuration module
│   ├── dto/                # Shared DTOs
│   ├── events/             # Event definitions
│   ├── guards/             # Auth guards
│   ├── messaging/          # Kafka integration
│   ├── persistence/        # TypeORM setup
│   └── validation/         # Validators
├── deployments/
│   ├── docker/             # Dockerfiles
│   └── k8s/                # Kubernetes manifests
├── scripts/                # Helper scripts
├── docker-compose.yml      # Local infrastructure
└── .env                    # Environment variables
```

## Environment Variables

Copy `.env.example` to `.env` and update as needed:

```bash
cp .env.example .env
```

Key variables for local development:
- `DB_HOST=localhost`
- `REDIS_HOST=localhost`
- `KAFKA_BROKERS=localhost:9092`
- `ELASTICSEARCH_NODE=http://localhost:9200`
- `S3_ENDPOINT=http://localhost:9000`

## Working with Services

### Service Architecture

Each service follows Domain-Driven Design (DDD):

```
apps/[service-name]/src/
├── config/                 # Service-specific config
├── domain/                 # Business logic
│   ├── entities/
│   ├── enums/
│   ├── value-objects/
│   └── services/
├── application/            # Use cases
│   ├── dto/
│   ├── services/
│   └── listeners/
├── infrastructure/         # External concerns
│   ├── persistence/
│   ├── messaging/
│   └── http/
└── interfaces/             # API layer
    ├── rest/
    └── graphql/
```

### Adding a New Service

1. Generate the service:
```bash
npx nest generate app new-service
```

2. Shape it with DDD structure:
```bash
./shape-services.sh
```

3. Add to docker-compose if needed

## Database Management

### Access PostgreSQL

```bash
# Via psql
docker exec -it mintcoin-postgres psql -U app -d app_db

# Via PgAdmin
# Open http://localhost:5050
# Use: admin@mintcoin.com / admin
```

### Create a Migration

```bash
yarn migration:generate apps/user-service/migrations/CreateUserTable
```

### Run Migrations

```bash
yarn migration:run
```

### Revert Migration

```bash
yarn migration:revert
```

## Kafka Management

### View Topics

```bash
# Via Kafka UI
# Open http://localhost:8080

# Via CLI
docker exec mintcoin-kafka kafka-topics --bootstrap-server localhost:9092 --list
```

### Produce Test Event

```bash
docker exec -it mintcoin-kafka kafka-console-producer \
  --bootstrap-server localhost:9092 \
  --topic user.profile.created
```

### Consume Events

```bash
docker exec -it mintcoin-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic user.profile.created \
  --from-beginning
```

## Redis Management

Access Redis Commander at `http://localhost:8081`

Or use CLI:
```bash
docker exec -it mintcoin-redis redis-cli
```

## MinIO (S3) Management

Access MinIO Console at `http://localhost:9001`
- Username: `minioadmin`
- Password: `minioadmin`

Create buckets:
- avatars
- media
- livestreams

## Elasticsearch

Check cluster health:
```bash
curl http://localhost:9200/_cluster/health
```

## Troubleshooting

### Services won't start
```bash
# Check Docker containers
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Restart everything
docker-compose down
docker-compose up -d
```

### Clear all data and restart fresh
```bash
docker-compose down -v
docker-compose up -d
./scripts/create-kafka-topics.sh
```

### Port conflicts
If ports are already in use, update `docker-compose.yml` with different ports.

### Database connection issues
Ensure PostgreSQL is healthy:
```bash
docker exec mintcoin-postgres pg_isready -U app
```

## Testing

### Run unit tests
```bash
yarn test
```

### Run tests for specific service
```bash
yarn test auth-service
```

### Run e2e tests
```bash
yarn test:e2e
```

## Code Quality

### Lint code
```bash
yarn lint
```

### Format code
```bash
yarn format
```

## Building for Production

```bash
# Build all services
yarn build

# Build specific service
yarn build:auth-service
```

## Useful Commands

```bash
# Stop all services
docker-compose down

# View all logs
docker-compose logs -f

# Restart specific service
docker-compose restart postgres

# Clean build artifacts
rm -rf dist/

# Clean node_modules
rm -rf node_modules/
yarn install
```

## Architecture Overview

```
┌─────────────┐
│   Clients   │
└──────┬──────┘
       │
┌──────▼──────────┐
│  API Gateway    │
└──────┬──────────┘
       │
       ├─────────────┐─────────────┐─────────────┐
       │             │             │             │
┌──────▼──────┐ ┌───▼────┐ ┌──────▼──────┐ ┌───▼──────┐
│ Auth Service│ │  User  │ │   Wallet    │ │   Room   │
└──────┬──────┘ │Service │ │   Service   │ │ Service  │
       │        └───┬────┘ └──────┬──────┘ └────┬─────┘
       │            │             │              │
       └────────────┴─────────────┴──────────────┘
                          │
                    ┌─────▼─────┐
                    │   Kafka   │ (Event Bus)
                    └─────┬─────┘
                          │
       ┌──────────────────┼──────────────────┐
       │                  │                  │
┌──────▼──────┐  ┌────────▼────────┐  ┌─────▼─────┐
│  Analytics  │  │  Notification   │  │   Fraud   │
│   Service   │  │     Service     │  │  Service  │
└─────────────┘  └─────────────────┘  └───────────┘

Infrastructure:
- PostgreSQL (per-service databases)
- Redis (cache, sessions)
- Kafka (event streaming)
- Elasticsearch (search)
- MinIO (object storage)
```

## Next Steps

1. Review the BackendPRD for business requirements
2. Implement database entities in each service
3. Set up authentication flow in auth-service
4. Implement shared libraries (messaging, events, guards)
5. Start with core user journey (signup → profile → wallet)

## Support

For issues or questions, check the main README.md or create an issue.
