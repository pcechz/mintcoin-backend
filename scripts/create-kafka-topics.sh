#!/bin/bash
# ============================================
# MINTCOIN - KAFKA TOPICS INITIALIZATION
# ============================================
# This script creates all required Kafka topics
# for event-driven communication between services
# ============================================

set -e

KAFKA_CONTAINER="mintcoin-kafka"
PARTITIONS=3
REPLICATION_FACTOR=1

echo "======================================"
echo "Creating Kafka Topics for Mintcoin"
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

# ============================================
# AUTH & USER EVENTS
# ============================================
create_topic "auth.otp.sent"
create_topic "auth.otp.verified"
create_topic "auth.user.registered"
create_topic "auth.user.login"
create_topic "auth.user.logout"
create_topic "auth.session.created"
create_topic "auth.session.revoked"

create_topic "user.profile.created"
create_topic "user.profile.updated"
create_topic "user.status.changed"
create_topic "user.suspended"
create_topic "user.banned"

# ============================================
# KYC EVENTS
# ============================================
create_topic "kyc.verification.requested"
create_topic "kyc.verification.completed"
create_topic "kyc.verification.failed"
create_topic "kyc.tier.upgraded"

# ============================================
# WALLET & COINS EVENTS
# ============================================
create_topic "coins.purchased"
create_topic "coins.spent"
create_topic "coins.earned"
create_topic "wallet.credited"
create_topic "wallet.debited"
create_topic "wallet.withdrawal.requested"
create_topic "wallet.withdrawal.processed"
create_topic "wallet.withdrawal.failed"

# ============================================
# LEDGER EVENTS
# ============================================
create_topic "ledger.transaction.created"
create_topic "ledger.transaction.failed"

# ============================================
# PAYMENT EVENTS
# ============================================
create_topic "payment.initiated"
create_topic "payment.success"
create_topic "payment.failed"
create_topic "payment.refunded"

# ============================================
# ROOM EVENTS (Chat-based group rooms like 2go)
# ============================================
create_topic "room.created"
create_topic "room.started"
create_topic "room.ended"
create_topic "room.joined"
create_topic "room.left"
create_topic "room.message.sent"
create_topic "room.message.deleted"
create_topic "room.user.typing"
create_topic "room.user.muted"
create_topic "room.user.kicked"
create_topic "room.member.role_changed"

# ============================================
# CALL EVENTS
# ============================================
create_topic "call.initiated"
create_topic "call.started"
create_topic "call.ended"
create_topic "call.billing.tick"
create_topic "call.billing.insufficient_funds"

# ============================================
# CHAT & MESSAGING EVENTS
# ============================================
create_topic "chat.message.sent"
create_topic "chat.message.delivered"
create_topic "chat.message.read"
create_topic "chat.message.deleted"
create_topic "chat.typing"

# ============================================
# GIFT EVENTS
# ============================================
create_topic "gift.sent"
create_topic "gift.received"
create_topic "gift.combo.triggered"

# ============================================
# REFERRAL EVENTS
# ============================================
create_topic "referral.created"
create_topic "referral.signup"
create_topic "referral.earnings.accrued"
create_topic "referral.payout"

# ============================================
# LIVESTREAM EVENTS
# ============================================
create_topic "livestream.started"
create_topic "livestream.ended"
create_topic "livestream.viewer.joined"
create_topic "livestream.viewer.left"
create_topic "livestream.comment"

# ============================================
# SOCIAL GRAPH EVENTS
# ============================================
create_topic "social.follow"
create_topic "social.unfollow"
create_topic "social.block"
create_topic "social.unblock"

# ============================================
# NOTIFICATION EVENTS
# ============================================
create_topic "notification.push"
create_topic "notification.sms"
create_topic "notification.email"
create_topic "notification.in_app"

# ============================================
# MODERATION EVENTS
# ============================================
create_topic "moderation.report.created"
create_topic "moderation.content.flagged"
create_topic "moderation.action.taken"

# ============================================
# FRAUD EVENTS
# ============================================
create_topic "fraud.alert"
create_topic "fraud.device.flagged"
create_topic "fraud.ip.flagged"
create_topic "fraud.pattern.detected"

# ============================================
# ANALYTICS EVENTS
# ============================================
create_topic "analytics.user.action"
create_topic "analytics.revenue"
create_topic "analytics.engagement"

echo "======================================"
echo "All Kafka topics created successfully!"
echo "======================================"

# List all topics
echo ""
echo "Listing all topics:"
docker exec $KAFKA_CONTAINER kafka-topics --bootstrap-server localhost:9092 --list
