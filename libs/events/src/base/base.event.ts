/**
 * Base event interface that all events must implement
 *
 * All events in the system extend this base interface and add a `payload` property
 * with domain-specific data.
 */
export interface BaseEvent {
  eventId: string;
  eventType: string;
  timestamp: string;
  version: string;
  payload?: any; // Specific event types will override this with their own payload shape
  metadata?: EventMetadata;
}

/**
 * Event metadata for tracing and debugging
 */
export interface EventMetadata {
  correlationId?: string;
  causationId?: string;
  userId?: string;
  deviceId?: string;
  ipAddress?: string;
  source?: string;
}

/**
 * Event topics organized by domain
 */
export const EVENT_TOPICS = {
  // Auth & Session Events
  AUTH: {
    USER_REGISTERED: 'auth.user.registered',
    USER_LOGIN: 'auth.user.login',
    USER_LOGOUT: 'auth.user.logout',
    SESSION_CREATED: 'auth.session.created',
    SESSION_REFRESHED: 'auth.session.refreshed',
    SESSION_REVOKED: 'auth.session.revoked',
    OTP_SENT: 'auth.otp.sent',
    OTP_VERIFIED: 'auth.otp.verified',
    DEVICE_REGISTERED: 'auth.device.registered',
    DEVICE_TRUSTED: 'auth.device.trusted',
    DEVICE_BLOCKED: 'auth.device.blocked',
  },

  // User Events
  USER: {
    PROFILE_CREATED: 'user.profile.created',
    PROFILE_UPDATED: 'user.profile.updated',
    STATUS_CHANGED: 'user.status.changed',
    SUSPENDED: 'user.suspended',
    BANNED: 'user.banned',
  },

  // KYC Events
  KYC: {
    VERIFICATION_REQUESTED: 'kyc.verification.requested',
    VERIFICATION_COMPLETED: 'kyc.verification.completed',
    VERIFICATION_FAILED: 'kyc.verification.failed',
    TIER_UPGRADED: 'kyc.tier.upgraded',
  },

  // Wallet & Coins Events
  COINS: {
    PURCHASED: 'coins.purchased',
    SPENT: 'coins.spent',
    EARNED: 'coins.earned',
  },

  WALLET: {
    CREDITED: 'wallet.credited',
    DEBITED: 'wallet.debited',
    WITHDRAWAL_REQUESTED: 'wallet.withdrawal.requested',
    WITHDRAWAL_PROCESSED: 'wallet.withdrawal.processed',
    WITHDRAWAL_FAILED: 'wallet.withdrawal.failed',
  },

  // Ledger Events
  LEDGER: {
    TRANSACTION_CREATED: 'ledger.transaction.created',
    TRANSACTION_FAILED: 'ledger.transaction.failed',
  },

  // Payment Events
  PAYMENT: {
    INITIATED: 'payment.initiated',
    SUCCESS: 'payment.success',
    FAILED: 'payment.failed',
    REFUNDED: 'payment.refunded',
  },

  // Room Events (Chat-based group rooms like 2go, not audio/video)
  ROOM: {
    CREATED: 'room.created',
    STARTED: 'room.started',
    ENDED: 'room.ended',
    JOINED: 'room.joined',
    LEFT: 'room.left',
    MESSAGE_SENT: 'room.message.sent',
    MESSAGE_DELETED: 'room.message.deleted',
    USER_TYPING: 'room.user.typing',
    USER_MUTED: 'room.user.muted',
    USER_KICKED: 'room.user.kicked',
    MEMBER_ROLE_CHANGED: 'room.member.role_changed',
  },

  // Call Events
  CALL: {
    INITIATED: 'call.initiated',
    STARTED: 'call.started',
    ENDED: 'call.ended',
    BILLING_TICK: 'call.billing.tick',
    INSUFFICIENT_FUNDS: 'call.billing.insufficient_funds',
  },

  // Chat Events
  CHAT: {
    MESSAGE_SENT: 'chat.message.sent',
    MESSAGE_DELIVERED: 'chat.message.delivered',
    MESSAGE_READ: 'chat.message.read',
    MESSAGE_DELETED: 'chat.message.deleted',
    TYPING: 'chat.typing',
  },

  // Gift Events
  GIFT: {
    SENT: 'gift.sent',
    RECEIVED: 'gift.received',
    COMBO_TRIGGERED: 'gift.combo.triggered',
  },

  // Referral Events
  REFERRAL: {
    CREATED: 'referral.created',
    SIGNUP: 'referral.signup',
    EARNINGS_ACCRUED: 'referral.earnings.accrued',
    PAYOUT: 'referral.payout',
  },

  // Livestream Events
  LIVESTREAM: {
    STARTED: 'livestream.started',
    ENDED: 'livestream.ended',
    VIEWER_JOINED: 'livestream.viewer.joined',
    VIEWER_LEFT: 'livestream.viewer.left',
    COMMENT: 'livestream.comment',
  },

  // Social Graph Events
  SOCIAL: {
    FOLLOW: 'social.follow',
    UNFOLLOW: 'social.unfollow',
    BLOCK: 'social.block',
    UNBLOCK: 'social.unblock',
  },

  // Notification Events
  NOTIFICATION: {
    PUSH: 'notification.push',
    SMS: 'notification.sms',
    EMAIL: 'notification.email',
    IN_APP: 'notification.in_app',
  },

  // Moderation Events
  MODERATION: {
    REPORT_CREATED: 'moderation.report.created',
    CONTENT_FLAGGED: 'moderation.content.flagged',
    ACTION_TAKEN: 'moderation.action.taken',
  },

  // Fraud Events
  FRAUD: {
    ALERT: 'fraud.alert',
    DEVICE_FLAGGED: 'fraud.device.flagged',
    IP_FLAGGED: 'fraud.ip.flagged',
    PATTERN_DETECTED: 'fraud.pattern.detected',
  },

  // Analytics Events
  ANALYTICS: {
    USER_ACTION: 'analytics.user.action',
    REVENUE: 'analytics.revenue',
    ENGAGEMENT: 'analytics.engagement',
  },
} as const;
