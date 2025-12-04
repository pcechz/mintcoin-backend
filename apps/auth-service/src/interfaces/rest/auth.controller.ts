import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  Get,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { MessagingService } from '@app/messaging';
import { EVENT_TOPICS } from '@app/events';
import { ResponseUtils } from '@app/common';
import { JwtAuthGuard, AuthenticatedRequest } from '@app/guards';
import { OtpService, SessionService, DeviceService } from '../../domain/services';
import { JwtPayload } from '../../domain/services/session.service';
import { UserIdentityService } from '../../application/services';
import {
  SendOtpDto,
  VerifyOtpDto,
  LoginDto,
  RefreshTokenDto,
  LogoutDto,
  AuthResponse,
  OtpResponse,
} from '../../application/dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly otpService: OtpService,
    private readonly sessionService: SessionService,
    private readonly deviceService: DeviceService,
    private readonly messagingService: MessagingService,
    private readonly userIdentityService: UserIdentityService,
  ) {}

  /**
   * Request OTP code for phone or email
   * POST /auth/otp/send
   */
  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  async sendOtp(
    @Body() dto: SendOtpDto,
    @Req() req: Request,
  ): Promise<OtpResponse> {
    const identifier = dto.identifierType === 'phone' ? dto.phone : dto.email;

    if (!identifier) {
      throw new BadRequestException(`${dto.identifierType} is required`);
    }

    const ipAddress = this.getRequestIp(req);

    const { code, expiresAt } = await this.otpService.generateOtp(
      identifier,
      dto.identifierType,
      dto.purpose,
      dto.deviceId,
      ipAddress,
    );

    // TODO: integrate SMS/Email provider
    this.logOtp(identifier, code);

    await this.messagingService.publish(EVENT_TOPICS.AUTH.OTP_SENT, {
      eventType: EVENT_TOPICS.AUTH.OTP_SENT,
      payload: {
        identifier,
        identifierType: dto.identifierType,
        purpose: dto.purpose,
        expiresAt: expiresAt.toISOString(),
        deviceId: dto.deviceId,
        ipAddress,
      },
    });

    const expiresInSeconds = Math.floor(
      (expiresAt.getTime() - Date.now()) / 1000,
    );

    return {
      success: true,
      message: `OTP sent to your ${dto.identifierType}`,
      expiresIn: expiresInSeconds,
      expiresAt: expiresAt.toISOString(),
    };
  }

  /**
   * Verify OTP code
   * POST /auth/otp/verify
   */
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Req() req: Request,
  ): Promise<any> {
    const identifier = dto.identifierType === 'phone' ? dto.phone : dto.email;

    if (!identifier) {
      throw new BadRequestException('Phone or email is required');
    }

    const verification = await this.otpService.verifyOtp(
      identifier,
      dto.identifierType,
      dto.code,
      dto.purpose,
    );

    await this.messagingService.publish(EVENT_TOPICS.AUTH.OTP_VERIFIED, {
      eventType: EVENT_TOPICS.AUTH.OTP_VERIFIED,
      payload: {
        identifier,
        identifierType: dto.identifierType,
        purpose: dto.purpose,
        deviceId: dto.deviceId,
        verificationToken: verification.verificationToken,
      },
    });

    return ResponseUtils.success(
      {
        verified: true,
        verificationToken: verification.verificationToken,
        otpId: verification.otpId,
        expiresAt: verification.expiresAt.toISOString(),
      },
      'OTP verified successfully',
    );
  }

  /**
   * Login - Create session and return tokens
   * POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ): Promise<any> {
    const identifier = dto.identifier.trim();
    const ipAddress = dto.ipAddress || this.getRequestIp(req);
    const userAgent = req.headers['user-agent'] || '';
    const loginPurpose = dto.purpose ?? 'login';

    const verifiedOtp = await this.otpService.validateVerifiedOtp(
      identifier,
      dto.identifierType,
      loginPurpose,
      dto.verificationToken,
    );

    const user = await this.userIdentityService.getOrCreateUser({
      identifier,
      identifierType: dto.identifierType,
      deviceId: dto.deviceId,
      ipAddress,
    });

    const device = await this.deviceService.registerDevice(
      user.id,
      dto.deviceId,
      userAgent,
      ipAddress,
      dto.deviceName,
    );

    if (device.isBlocked) {
      throw new UnauthorizedException('This device has been blocked');
    }

    const suspiciousCheck = await this.deviceService.checkSuspiciousActivity(
      user.id,
      dto.deviceId,
      ipAddress,
    );

    if (suspiciousCheck.isSuspicious) {
      this.logger.warn(
        `Suspicious login for user ${user.id}: ${suspiciousCheck.reasons.join(', ')}`,
      );
    }

    const { session, tokens } = await this.sessionService.createSession(
      user.id,
      dto.deviceId,
      ipAddress,
      userAgent,
    );

    await this.userIdentityService.recordLogin(user.id, {
      deviceId: dto.deviceId,
      ipAddress,
    });
    await this.otpService.consumeVerifiedOtp(verifiedOtp.id);

    await this.messagingService.publish(EVENT_TOPICS.AUTH.SESSION_CREATED, {
      eventType: EVENT_TOPICS.AUTH.SESSION_CREATED,
      payload: {
        sessionId: session.id,
        userId: user.id,
        deviceId: dto.deviceId,
        ipAddress,
        loginMethod: dto.identifierType,
      },
    });

    await this.messagingService.publish(EVENT_TOPICS.AUTH.USER_LOGIN, {
      eventType: EVENT_TOPICS.AUTH.USER_LOGIN,
      payload: {
        userId: user.id,
        deviceId: dto.deviceId,
        ipAddress,
        loginMethod: dto.identifierType,
        needsOnboarding: user.needsOnboarding,
      },
    });

    const response: AuthResponse = {
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        username: user.username,
        status: user.status,
        profileCompletionPercent: user.profileCompletionPercent,
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
      sessionId: session.id,
      needsProfileCompletion: Boolean(user.needsOnboarding),
    };

    return ResponseUtils.success(response, 'Login successful');
  }

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<any> {
    const { tokens, session } = await this.sessionService.refreshTokens(
      dto.refreshToken,
      dto.deviceId,
    );

    await this.messagingService.publish(EVENT_TOPICS.AUTH.SESSION_REFRESHED, {
      eventType: EVENT_TOPICS.AUTH.SESSION_REFRESHED,
      payload: {
        sessionId: session.id,
        userId: session.userId,
        deviceId: dto.deviceId,
      },
    });

    return ResponseUtils.success(
      {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
      'Token refreshed successfully',
    );
  }

  /**
   * Logout - Revoke session
   * POST /auth/logout
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(
    @Body() dto: LogoutDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<any> {
    const payload = req.user as JwtPayload;

    await this.sessionService.revokeSession(dto.sessionId, payload.sub, 'logout');

    await this.messagingService.publish(EVENT_TOPICS.AUTH.USER_LOGOUT, {
      eventType: EVENT_TOPICS.AUTH.USER_LOGOUT,
      payload: {
        userId: payload.sub,
        sessionId: dto.sessionId,
        deviceId: dto.deviceId || 'unknown',
      },
    });

    await this.messagingService.publish(EVENT_TOPICS.AUTH.SESSION_REVOKED, {
      eventType: EVENT_TOPICS.AUTH.SESSION_REVOKED,
      payload: {
        sessionId: dto.sessionId,
        userId: payload.sub,
        reason: 'logout',
      },
    });

    return ResponseUtils.success(null, 'Logged out successfully');
  }

  /**
   * Get current user's active sessions
   * GET /auth/sessions
   */
  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getSessions(@Req() req: AuthenticatedRequest): Promise<any> {
    const payload = req.user as JwtPayload;

    const sessions = await this.sessionService.getUserSessions(payload.sub);

    return ResponseUtils.success(sessions, 'Sessions retrieved successfully');
  }

  /**
   * Revoke all sessions (logout from all devices)
   * POST /auth/sessions/revoke-all
   */
  @Post('sessions/revoke-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async revokeAllSessions(@Req() req: AuthenticatedRequest): Promise<any> {
    const payload = req.user as JwtPayload;

    await this.sessionService.revokeAllUserSessions(payload.sub, 'security');

    return ResponseUtils.success(
      null,
      'All sessions revoked successfully',
    );
  }

  private getRequestIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];

    if (Array.isArray(forwarded)) {
      return forwarded[0];
    }

    if (typeof forwarded === 'string' && forwarded.length > 0) {
      return forwarded.split(',')[0].trim();
    }

    return req.ip;
  }

  private logOtp(identifier: string, code: string): void {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`OTP for ${identifier}: ${code}`);
    }
  }
}
