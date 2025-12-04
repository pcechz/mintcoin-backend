import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@app/persistence';
import { UserStatus, UserLifecycleState, KycStatus, KycTier } from '@app/common';

/**
 * User entity - main user account information
 * Contains authentication details, profile info, and account status
 */
@Entity('users')
@Index(['phone'])
@Index(['email'])
@Index(['username'])
@Index(['referralCode'])
@Index(['status'])
export class User extends BaseEntity {
  // ========================================
  // Authentication & Identity
  // ========================================

  @Column({ name: 'phone', type: 'varchar', length: 20, unique: true, nullable: true })
  phone?: string;

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true, nullable: true })
  email?: string;

  @Column({ name: 'phone_verified', type: 'boolean', default: false })
  phoneVerified: boolean;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified: boolean;

  // ========================================
  // Profile Information
  // ========================================

  @Column({ name: 'username', type: 'varchar', length: 50, unique: true })
  @Index()
  username: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl?: string;

  @Column({ name: 'bio', type: 'text', nullable: true })
  bio?: string;

  @Column({ name: 'gender', type: 'varchar', length: 20, nullable: true })
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';

  @Column({ name: 'age_bracket', type: 'varchar', length: 20, nullable: true })
  ageBracket?: '18-24' | '25-34' | '35-44' | '45-54' | '55+';

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ name: 'location', type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({ name: 'interests', type: 'json', nullable: true })
  interests?: string[];

  // ========================================
  // Account Status
  // ========================================

  @Column({
    name: 'status',
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_SETUP
  })
  status: UserStatus;

  @Column({
    name: 'lifecycle_state',
    type: 'enum',
    enum: UserLifecycleState,
    default: UserLifecycleState.NEW_USER
  })
  lifecycleState: UserLifecycleState;

  @Column({ name: 'is_creator', type: 'boolean', default: false })
  isCreator: boolean;

  @Column({ name: 'is_suspended', type: 'boolean', default: false })
  isSuspended: boolean;

  @Column({ name: 'is_banned', type: 'boolean', default: false })
  isBanned: boolean;

  @Column({ name: 'suspended_at', type: 'timestamp', nullable: true })
  suspendedAt?: Date;

  @Column({ name: 'suspended_until', type: 'timestamp', nullable: true })
  suspendedUntil?: Date;

  @Column({ name: 'suspended_reason', type: 'text', nullable: true })
  suspendedReason?: string;

  @Column({ name: 'banned_at', type: 'timestamp', nullable: true })
  bannedAt?: Date;

  @Column({ name: 'banned_reason', type: 'text', nullable: true })
  bannedReason?: string;

  // ========================================
  // KYC & Verification
  // ========================================

  @Column({
    name: 'kyc_status',
    type: 'enum',
    enum: KycStatus,
    default: KycStatus.NOT_STARTED
  })
  kycStatus: KycStatus;

  @Column({
    name: 'kyc_tier',
    type: 'enum',
    enum: KycTier,
    default: KycTier.TIER_0
  })
  kycTier: KycTier;

  @Column({ name: 'kyc_verified_at', type: 'timestamp', nullable: true })
  kycVerifiedAt?: Date;

  @Column({ name: 'can_earn', type: 'boolean', default: false })
  canEarn: boolean;

  @Column({ name: 'can_withdraw', type: 'boolean', default: false })
  canWithdraw: boolean;

  // ========================================
  // Referral System
  // ========================================

  @Column({ name: 'referral_code', type: 'varchar', length: 20, unique: true })
  @Index()
  referralCode: string;

  @Column({ name: 'referred_by_code', type: 'varchar', length: 20, nullable: true })
  referredByCode?: string;

  @Column({ name: 'referred_by_user_id', type: 'uuid', nullable: true })
  referredByUserId?: string;

  // ========================================
  // Engagement & Activity
  // ========================================

  @Column({ name: 'last_active_at', type: 'timestamp', nullable: true })
  lastActiveAt?: Date;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ name: 'login_count', type: 'int', default: 0 })
  loginCount: number;

  @Column({ name: 'profile_completion_percent', type: 'int', default: 0 })
  profileCompletionPercent: number;

  // ========================================
  // Metadata
  // ========================================

  @Column({ name: 'device_id', type: 'varchar', length: 255, nullable: true })
  deviceId?: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ name: 'registration_source', type: 'varchar', length: 50, nullable: true })
  registrationSource?: 'mobile_app' | 'web' | 'referral' | 'admin';

  @Column({ name: 'metadata', type: 'json', nullable: true })
  metadata?: Record<string, any>;
}
