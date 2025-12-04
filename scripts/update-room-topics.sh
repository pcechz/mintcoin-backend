#!/bin/bash
# ============================================
# Add new room message topics for chat-based rooms
# ============================================

set -e

KAFKA_CONTAINER="mintcoin-kafka"
PARTITIONS=3
REPLICATION_FACTOR=1

echo "======================================"
echo "Adding New Room Message Topics"
echo "======================================"

# Function to create topic
create_topic() {
  local TOPIC=$1
  echo "Creating topic: $TOPIC"

  docker exec $KAFKA_CONTAINER kafka-topics \
    --create \
    --bootstrap-server localhost:9092 \
    --topic "$TOPIC" \
    --partitions $PARTITIONS \
    --replication-factor $REPLICATION_FACTOR \
    --if-not-exists
}

# Create new room message topics
create_topic "room.message.sent"
create_topic "room.message.deleted"
create_topic "room.user.typing"
create_topic "room.member.role_changed"

echo "======================================"
echo "New room topics created successfully!"
echo "======================================"

# List all room topics
echo ""
echo "All room topics:"
docker exec $KAFKA_CONTAINER kafka-topics --bootstrap-server localhost:9092 --list | grep "room\."
