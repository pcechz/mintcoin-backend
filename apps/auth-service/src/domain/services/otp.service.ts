import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
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
   * Generate and save OTP code
   */
  async generateOtp(
    identifier: string,
    identifierType: 'phone' | 'email',
    purpose: 'signup' | 'login' | 'password_reset' | 'phone_verification' | 'email_verification',
    deviceId?: string,
    ipAddress?: string,
  ): Promise<{ code: string; expiresAt: Date }> {
    // Check rate limiting
    await this.checkRateLimit(identifier);

    // Invalidate old OTPs for this identifier
    await this.invalidateOldOtps(identifier, purpose);

    // Generate OTP code
    const otpLength = this.configService.get<number>('OTP_LENGTH', 6);
    const code = CryptoUtils.generateOTP(otpLength);

    // Calculate expiration
    const expirationMinutes = this.configService.get<number>('OTP_EXPIRATION_MINUTES', 5);
    const expiresAt = DateUtils.addTime(expirationMinutes, 'minute');

    // Save OTP
    const otp = this.otpRepository.create({
      identifier,
      identifierType,
      code,
      purpose,
      expiresAt,
      deviceId,
      ipAddress,
      maxAttempts: this.configService.get<number>('OTP_MAX_ATTEMPTS', 3),
    });

    await this.otpRepository.save(otp);

    this.logger.log(`OTP generated for ${identifier} (${purpose})`);

    return { code, expiresAt };
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(
    identifier: string,
    code: string,
    purpose: 'signup' | 'login' | 'password_reset' | 'phone_verification' | 'email_verification',
  ): Promise<boolean> {
    // Find the OTP
    const otp = await this.otpRepository.findOne({
      where: {
        identifier,
        code,
        purpose,
        isUsed: false,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP code');
    }

    // Check if expired
    if (DateUtils.isPast(otp.expiresAt)) {
      throw new BadRequestException('OTP code has expired');
    }

    // Check attempts
    if (otp.attempts >= otp.maxAttempts) {
      throw new BadRequestException('Maximum OTP attempts exceeded');
    }

    // Increment attempts
    otp.attempts += 1;

    // Mark as used
    otp.isUsed = true;
    otp.usedAt = DateUtils.nowDate();

    await this.otpRepository.save(otp);

    this.logger.log(`OTP verified successfully for ${identifier}`);

    return true;
  }

  /**
   * Check rate limiting for OTP requests
   */
  private async checkRateLimit(identifier: string): Promise<void> {
    const oneMinuteAgo = DateUtils.subtractTime(1, 'minute');
    const oneHourAgo = DateUtils.subtractTime(1, 'hour');

    // Check last minute
    const recentOtpsMinute = await this.otpRepository.count({
      where: {
        identifier,
        createdAt: LessThan(oneMinuteAgo) as any,
      },
    });

    const maxPerMinute = this.configService.get<number>('OTP_MAX_PER_MINUTE', 3);
    if (recentOtpsMinute >= maxPerMinute) {
      throw new BadRequestException(
        'Too many OTP requests. Please wait a minute before trying again.',
      );
    }

    // Check last hour
    const recentOtpsHour = await this.otpRepository.count({
      where: {
        identifier,
        createdAt: LessThan(oneHourAgo) as any,
      },
    });

    const maxPerHour = this.configService.get<number>('OTP_MAX_PER_HOUR', 10);
    if (recentOtpsHour >= maxPerHour) {
      throw new BadRequestException(
        'Too many OTP requests. Please try again later.',
      );
    }
  }

  /**
   * Invalidate old OTPs for identifier
   * Marks all existing unused OTPs as used before generating a new one
   */
  private async invalidateOldOtps(
    identifier: string,
    purpose: string,
  ): Promise<void> {
    await this.otpRepository.update(
      {
        identifier,
        purpose: purpose as any, // Type assertion needed for TypeORM update where clause
        isUsed: false,
      },
      {
        isUsed: true,
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
}
