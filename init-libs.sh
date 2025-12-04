#!/bin/bash
set -e

echo "Creating libs directory..."
mkdir -p libs

create_lib () {
  NAME=$1

  echo "----------------------------------------"
  echo "Creating lib: $NAME"
  echo "----------------------------------------"

  # Nest v10: this always creates libs/<name>/
  npx nest generate library "$NAME"

  echo "Lib created: libs/$NAME"
  echo
}

create_lib "common"      # Shared utils (date, logging, constants)
create_lib "config"      # Shared config loaders (env, validation)
create_lib "dto"         # Shared DTOs, interfaces
create_lib "events"      # Event interfaces, topics, payload definitions
create_lib "guards"      # Auth guards, roles, permissions
create_lib "persistence" # Base TypeORM entities & repos
create_lib "messaging"   # Kafka/RabbitMQ client wrappers
create_lib "validation"  # Class-validator decorators, pipes

echo "----------------------------------------"
echo "All libs generated under libs/ ✅"
echo "----------------------------------------"
