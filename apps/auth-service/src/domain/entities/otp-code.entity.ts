import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@app/persistence';

/**
 * OTP Code entity for phone/email verification
 * Used during signup, login, and password reset
 */
@Entity('otp_codes')
@Index(['identifier', 'isUsed', 'expiresAt'])
export class OtpCode extends BaseEntity {
  @Column({ name: 'identifier', type: 'varchar', length: 100 })
  @Index()
  identifier: string; // Phone number or email

  @Column({ name: 'identifier_type', type: 'varchar', length: 20 })
  identifierType: 'phone' | 'email';

  @Column({ name: 'code', type: 'varchar', length: 10 })
  code: string;

  @Column({ name: 'purpose', type: 'varchar', length: 50 })
  purpose: 'signup' | 'login' | 'password_reset' | 'phone_verification' | 'email_verification';

  @Column({ name: 'is_used', type: 'boolean', default: false })
  isUsed: boolean;

  @Column({ name: 'used_at', type: 'timestamp', nullable: true })
  usedAt?: Date;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'attempts', type: 'int', default: 0 })
  attempts: number;

  @Column({ name: 'max_attempts', type: 'int', default: 3 })
  maxAttempts: number;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ name: 'device_id', type: 'varchar', length: 255, nullable: true })
  deviceId?: string;
}
