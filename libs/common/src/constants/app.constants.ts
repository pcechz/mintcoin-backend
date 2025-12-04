/**
 * Application-wide constants
 */

// User Statuses (from PRD Section 6)
export enum UserStatus {
  PENDING_SETUP = 'pending_setup',
  ACTIVE = 'active',
  VERIFIED_CREATOR = 'verified_creator',
  PAYOUT_ENABLED = 'payout_enabled',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

// User Lifecycle States (from PRD Section 6.4)
export enum UserLifecycleState {
  NEW_USER = 'new_user', // 0-2 days
  WARM_USER = 'warm_user', // 3-14 days
  ENGAGED = 'engaged', // 15+ days
  CREATOR = 'creator',
  HIGH_VALUE_SPENDER = 'high_value_spender',
  DORMANT = 'dormant', // no activity for 14 days
  CHURNED = 'churned', // no activity for 45+ days
}

// KYC Tiers (from PRD Section 8.1)
export enum KycTier {
  TIER_0 = 'tier_0', // No KYC
  TIER_1 = 'tier_1', // Basic NIN
  TIER_2 = 'tier_2', // Advanced (Face match)
}

// KYC Status
export enum KycStatus {
  NOT_STARTED = 'not_started',
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  VERIFIED = 'verified',
  FAILED = 'failed',
  REJECTED = 'rejected',
}

// Wallet Types (from PRD Section 9.1)
export enum WalletType {
  MAIN = 'main', // For spending
  EARNINGS = 'earnings', // For creator revenue
}

// Transaction Types (from PRD Section 9.2)
export enum TransactionType {
  COIN_PURCHASE = 'COIN_PURCHASE',
  CALL_BILLING = 'CALL_BILLING',
  GIFT = 'GIFT',
  ROOM_ENTRY = 'ROOM_ENTRY',
  LIVESTREAM_GIFT = 'LIVESTREAM_GIFT',
  WITHDRAWAL = 'WITHDRAWAL',
  REFUND = 'REFUND',
  REFERRAL_COMMISSION = 'REFERRAL_COMMISSION',
  PLATFORM_COMMISSION = 'PLATFORM_COMMISSION',
  ADJUSTMENT = 'ADJUSTMENT',
}

// Room Visibility (Rooms are chat-based groups like 2go, not audio/video)
export enum RoomVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

// Room Member Roles
export enum RoomMemberRole {
  HOST = 'host',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member',
}

// Call Types
export enum CallType {
  AUDIO = 'audio',
  VIDEO = 'video',
}

// Payment Methods
export enum PaymentMethod {
  PAYSTACK = 'paystack',
  FLUTTERWAVE = 'flutterwave',
  BANK_TRANSFER = 'bank_transfer',
}

// Payment Status
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

// Withdrawal Status
export enum WithdrawalStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// Notification Types
export enum NotificationType {
  PUSH = 'push',
  SMS = 'sms',
  EMAIL = 'email',
  IN_APP = 'in_app',
}

// Economic Constants (from PRD Section 10.4)
export const ECONOMIC_CONSTANTS = {
  PLATFORM_COMMISSION_PERCENT: 20,
  CREATOR_EARNINGS_PERCENT: 80,
  MINIMUM_WITHDRAWAL_COINS: 1000,
  COIN_TO_NAIRA_RATE: 5,
  CALL_RATE_PER_MINUTE_COINS: 10,
  BILLING_TICK_INTERVAL_SECONDS: 10,
  ROOM_ENTRY_FEE_COINS: 10, // Optional entry fee for premium rooms
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  OTP_PER_MINUTE: 3,
  OTP_PER_HOUR: 10,
  API_REQUESTS_PER_MINUTE: 100,
} as const;

// Pagination
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
