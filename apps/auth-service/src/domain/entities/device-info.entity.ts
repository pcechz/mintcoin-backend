import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@app/persistence';

/**
 * Device Info entity for device binding and tracking
 * Used for security, fraud detection, and suspicious login alerts
 */
@Entity('device_info')
@Index(['userId', 'isTrusted'])
@Index(['deviceId'])
@Index(['fingerprint'])
export class DeviceInfo extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({ name: 'device_id', type: 'varchar', length: 255, unique: true })
  deviceId: string;

  @Column({ name: 'device_name', type: 'varchar', length: 255, nullable: true })
  deviceName?: string;

  @Column({ name: 'device_type', type: 'varchar', length: 50, nullable: true })
  deviceType?: 'mobile' | 'tablet' | 'desktop' | 'unknown';

  @Column({ name: 'os', type: 'varchar', length: 100, nullable: true })
  os?: string;

  @Column({ name: 'os_version', type: 'varchar', length: 50, nullable: true })
  osVersion?: string;

  @Column({ name: 'browser', type: 'varchar', length: 100, nullable: true })
  browser?: string;

  @Column({ name: 'browser_version', type: 'varchar', length: 50, nullable: true })
  browserVersion?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45 })
  ipAddress: string;

  @Column({ name: 'fingerprint', type: 'varchar', length: 64 })
  fingerprint: string;

  @Column({ name: 'is_trusted', type: 'boolean', default: false })
  isTrusted: boolean;

  @Column({ name: 'is_blocked', type: 'boolean', default: false })
  isBlocked: boolean;

  @Column({ name: 'first_seen_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  firstSeenAt: Date;

  @Column({ name: 'last_seen_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastSeenAt: Date;

  @Column({ name: 'login_count', type: 'int', default: 0 })
  loginCount: number;

  @Column({ name: 'blocked_reason', type: 'text', nullable: true })
  blockedReason?: string;
}
