import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceInfo } from '../entities';
import { CryptoUtils, DateUtils } from '@app/common';

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);

  constructor(
    @InjectRepository(DeviceInfo)
    private readonly deviceRepository: Repository<DeviceInfo>,
  ) {}

  /**
   * Register or update device information
   */
  async registerDevice(
    userId: string,
    deviceId: string,
    userAgent: string,
    ipAddress: string,
    deviceName?: string,
  ): Promise<DeviceInfo> {
    // Generate device fingerprint
    const fingerprint = CryptoUtils.generateDeviceFingerprint(userAgent, ipAddress);

    // Check if device already exists
    let device = await this.deviceRepository.findOne({
      where: { deviceId },
    });

    if (device) {
      // Update existing device
      device.lastSeenAt = DateUtils.nowDate();
      device.loginCount += 1;
      device.ipAddress = ipAddress;
      device.userAgent = userAgent;

      if (deviceName) {
        device.deviceName = deviceName;
      }

      await this.deviceRepository.save(device);
      this.logger.log(`Device updated: ${deviceId} for user ${userId}`);
    } else {
      // Create new device
      device = this.deviceRepository.create({
        userId,
        deviceId,
        deviceName,
        userAgent,
        ipAddress,
        fingerprint,
        isTrusted: false,
        isBlocked: false,
        firstSeenAt: DateUtils.nowDate(),
        lastSeenAt: DateUtils.nowDate(),
        loginCount: 1,
        ...this.parseUserAgent(userAgent),
      });

      await this.deviceRepository.save(device);
      this.logger.log(`New device registered: ${deviceId} for user ${userId}`);
    }

    return device;
  }

  /**
   * Check if device is trusted
   */
  async isTrustedDevice(deviceId: string): Promise<boolean> {
    const device = await this.deviceRepository.findOne({
      where: { deviceId },
    });

    return device?.isTrusted || false;
  }

  /**
   * Check if device is blocked
   */
  async isBlockedDevice(deviceId: string): Promise<boolean> {
    const device = await this.deviceRepository.findOne({
      where: { deviceId },
    });

    return device?.isBlocked || false;
  }

  /**
   * Mark device as trusted
   */
  async trustDevice(deviceId: string): Promise<void> {
    await this.deviceRepository.update(
      { deviceId },
      { isTrusted: true },
    );

    this.logger.log(`Device marked as trusted: ${deviceId}`);
  }

  /**
   * Block a device
   */
  async blockDevice(deviceId: string, reason: string): Promise<void> {
    await this.deviceRepository.update(
      { deviceId },
      {
        isBlocked: true,
        blockedReason: reason,
      },
    );

    this.logger.warn(`Device blocked: ${deviceId} - ${reason}`);
  }

  /**
   * Get all devices for a user
   */
  async getUserDevices(userId: string): Promise<DeviceInfo[]> {
    return this.deviceRepository.find({
      where: { userId },
      order: { lastSeenAt: 'DESC' },
    });
  }

  /**
   * Check for suspicious device activity
   */
  async checkSuspiciousActivity(
    userId: string,
    deviceId: string,
    ipAddress: string,
  ): Promise<{ isSuspicious: boolean; reasons: string[] }> {
    const devices = await this.getUserDevices(userId);
    const device = devices.find((d) => d.deviceId === deviceId);
    const isKnownDevice = Boolean(device);
    const reasons: string[] = [];

    if (!isKnownDevice && devices.length > 0) {
      reasons.push('NEW_DEVICE');
    }

    if (device && device.ipAddress !== ipAddress) {
      reasons.push('IP_CHANGED');
    }

    const hourAgo = DateUtils.subtractTime(1, 'hour');
    const recentIps = devices
      .filter((d) => DateUtils.isBetween(d.lastSeenAt, hourAgo, DateUtils.nowDate()))
      .map((d) => d.ipAddress);

    if (new Set(recentIps).size > 3) {
      reasons.push('MULTIPLE_IPS');
    }

    return {
      isSuspicious: reasons.length > 0,
      reasons,
    };
  }

  /**
   * Parse user agent to extract device info
   */
  private parseUserAgent(userAgent: string): Partial<DeviceInfo> {
    // Simple parsing - you can use a library like 'ua-parser-js' for better parsing
    const info: Partial<DeviceInfo> = {
      deviceType: 'unknown',
      os: undefined,
      osVersion: undefined,
      browser: undefined,
      browserVersion: undefined,
    };

    if (!userAgent) return info;

    const ua = userAgent.toLowerCase();

    // Device type
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      info.deviceType = 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      info.deviceType = 'tablet';
    } else {
      info.deviceType = 'desktop';
    }

    // OS
    if (ua.includes('windows')) info.os = 'Windows';
    else if (ua.includes('mac')) info.os = 'macOS';
    else if (ua.includes('linux')) info.os = 'Linux';
    else if (ua.includes('android')) info.os = 'Android';
    else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) info.os = 'iOS';

    // Browser
    if (ua.includes('chrome')) info.browser = 'Chrome';
    else if (ua.includes('safari')) info.browser = 'Safari';
    else if (ua.includes('firefox')) info.browser = 'Firefox';
    else if (ua.includes('edge')) info.browser = 'Edge';

    return info;
  }
}
