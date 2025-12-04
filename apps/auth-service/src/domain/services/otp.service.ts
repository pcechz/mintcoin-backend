import {
  Injectable,
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { OtpCode } from '../entities';
import { CryptoUtils, DateUtils } from '@app/common';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    @InjectRepository(OtpCode)
    private readonly otpRepository: Repository<OtpCode>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate and persist an OTP for onboarding/login
   */
  async generateOtp(
    identifier: string,
    identifierType: 'phone' | 'email',
    purpose:
      | 'signup'
      | 'login'
      | 'password_reset'
      | 'phone_verification'
      | 'email_verification',
    deviceId?: string,
    ipAddress?: string,
  ): Promise<{ code: string; expiresAt: Date; normalizedIdentifier: string }> {
    const normalizedIdentifier = this.normalizeIdentifier(identifier, identifierType);

    await this.checkRateLimit(normalizedIdentifier, identifierType);
    await this.invalidateOldOtps(normalizedIdentifier, identifierType, purpose);

    const otpLength = this.configService.get<number>('OTP_LENGTH', 6);
    const code = CryptoUtils.generateOTP(otpLength);
    const expirationMinutes = this.configService.get<number>('OTP_EXPIRATION_MINUTES', 5);
    const expiresAt = DateUtils.addTime(expirationMinutes, 'minute');

    const otp = this.otpRepository.create({
      identifier: normalizedIdentifier,
      identifierType,
      code,
      purpose,
      expiresAt,
      deviceId,
      ipAddress,
      attempts: 0,
      maxAttempts: this.configService.get<number>('OTP_MAX_ATTEMPTS', 3),
      isUsed: false,
      isVerified: false,
    });

    await this.otpRepository.save(otp);

    this.logger.log(`OTP generated for ${normalizedIdentifier} (${purpose})`);

    return { code, expiresAt, normalizedIdentifier };
  }

  /**
   * Verify an OTP code and return a verification token for the login step
   */
  async verifyOtp(
    identifier: string,
    identifierType: 'phone' | 'email',
    code: string,
    purpose:
      | 'signup'
      | 'login'
      | 'password_reset'
      | 'phone_verification'
      | 'email_verification',
  ): Promise<{ otpId: string; verificationToken: string; expiresAt: Date }> {
    const normalizedIdentifier = this.normalizeIdentifier(identifier, identifierType);

    const otp = await this.otpRepository.findOne({
      where: {
        identifier: normalizedIdentifier,
        identifierType,
        purpose,
      },
      order: { createdAt: 'DESC' },
    });

    if (!otp) {
      throw new BadRequestException('OTP not found. Please request a new code.');
    }

    if (otp.isUsed) {
      throw new BadRequestException('OTP has already been used');
    }

    if (DateUtils.isPast(otp.expiresAt)) {
      throw new BadRequestException('OTP code has expired');
    }

    if (otp.attempts >= otp.maxAttempts) {
      throw new BadRequestException('Maximum OTP attempts exceeded');
    }

    if (otp.code !== code) {
      otp.attempts += 1;
      await this.otpRepository.save(otp);
      throw new BadRequestException('Invalid OTP code');
    }

    if (otp.isVerified && otp.verificationToken) {
      // Allow idempotent verification retries
      return {
        otpId: otp.id,
        verificationToken: otp.verificationToken,
        expiresAt: otp.expiresAt,
      };
    }

    otp.isVerified = true;
    otp.verifiedAt = DateUtils.nowDate();
    otp.verificationToken = CryptoUtils.generateRandomString(64);
    otp.attempts = 0;

    await this.otpRepository.save(otp);

    this.logger.log(`OTP verified for ${normalizedIdentifier}`);

    return {
      otpId: otp.id,
      verificationToken: otp.verificationToken,
      expiresAt: otp.expiresAt,
    };
  }

  /**
   * Validate a verified OTP before creating a session
   */
  async validateVerifiedOtp(
    identifier: string,
    identifierType: 'phone' | 'email',
    purpose:
      | 'signup'
      | 'login'
      | 'password_reset'
      | 'phone_verification'
      | 'email_verification',
    verificationToken: string,
  ): Promise<OtpCode> {
    const normalizedIdentifier = this.normalizeIdentifier(identifier, identifierType);

    const otp = await this.otpRepository.findOne({
      where: {
        identifier: normalizedIdentifier,
        identifierType,
        purpose,
        verificationToken,
      },
      order: { createdAt: 'DESC' },
    });

    if (!otp || !otp.isVerified) {
      throw new UnauthorizedException('OTP verification required');
    }

    if (otp.isUsed) {
      throw new UnauthorizedException('OTP token has already been consumed');
    }

    if (DateUtils.isPast(otp.expiresAt)) {
      throw new UnauthorizedException('OTP token has expired');
    }

    return otp;
  }

  /**
   * Mark an OTP as consumed after login to prevent reuse
   */
  async consumeVerifiedOtp(otpId: string): Promise<void> {
    await this.otpRepository.update(
      { id: otpId },
      {
        isUsed: true,
        usedAt: DateUtils.nowDate(),
      },
    );
  }

  /**
   * Check rate limiting for OTP requests
   */
  private async checkRateLimit(
    identifier: string,
    identifierType: 'phone' | 'email',
  ): Promise<void> {
    const oneMinuteAgo = DateUtils.subtractTime(1, 'minute');
    const oneHourAgo = DateUtils.subtractTime(1, 'hour');

    const maxPerMinute = this.configService.get<number>('OTP_MAX_PER_MINUTE', 3);
    const maxPerHour = this.configService.get<number>('OTP_MAX_PER_HOUR', 10);

    const minuteCount = await this.otpRepository.count({
      where: {
        identifier,
        identifierType,
        createdAt: MoreThan(oneMinuteAgo) as any,
      },
    });

    if (minuteCount >= maxPerMinute) {
      throw new BadRequestException(
        'Too many OTP requests. Please wait a minute before trying again.',
      );
    }

    const hourCount = await this.otpRepository.count({
      where: {
        identifier,
        identifierType,
        createdAt: MoreThan(oneHourAgo) as any,
      },
    });

    if (hourCount >= maxPerHour) {
      throw new BadRequestException('You have reached the OTP hourly limit. Please try later.');
    }
  }

  /**
   * Invalidate unused OTPs before issuing a new one
   */
  private async invalidateOldOtps(
    identifier: string,
    identifierType: 'phone' | 'email',
    purpose: string,
  ): Promise<void> {
    await this.otpRepository.update(
      {
        identifier,
        identifierType,
        purpose: purpose as any,
        isUsed: false,
      },
      {
        isUsed: true,
        isVerified: false,
        verificationToken: null,
      },
    );
  }

  /**
   * Clean up expired OTPs (run periodically)
   */
  async cleanupExpiredOtps(): Promise<number> {
    const result = await this.otpRepository.delete({
      expiresAt: LessThan(DateUtils.nowDate()) as any,
    });

    this.logger.log(`Cleaned up ${result.affected || 0} expired OTPs`);
    return result.affected || 0;
  }

  /**
   * Normalize identifier for consistent storage/comparison
   */
  private normalizeIdentifier(
    identifier: string,
    identifierType: 'phone' | 'email',
  ): string {
    if (identifierType === 'email') {
      return identifier.trim().toLowerCase();
    }

    return identifier.replace(/\s+/g, '');
  }
}
