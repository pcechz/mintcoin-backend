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
} from '@nestjs/common';
import { Request } from 'express';
import { MessagingService } from '@app/messaging';
import { EVENT_TOPICS } from '@app/events';
import { ResponseUtils } from '@app/common';
import { OtpService, SessionService, DeviceService } from '../../domain/services';
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
  constructor(
    private readonly otpService: OtpService,
    private readonly sessionService: SessionService,
    private readonly deviceService: DeviceService,
    private readonly messagingService: MessagingService,
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
    const identifier = dto.channel === 'phone' ? dto.phone : dto.email;

    if (!identifier) {
      throw new BadRequestException(`${dto.channel} is required`);
    }

    const ipAddress = req.ip;

    // Generate OTP
    const { code, expiresAt } = await this.otpService.generateOtp(
      identifier,
      dto.channel,
      dto.purpose,
      dto.deviceId,
      ipAddress,
    );

    // TODO: Send OTP via SMS/Email
    // For now, we'll just log it (in production, integrate with SMS/Email provider)
    console.log(`OTP for ${identifier}: ${code}`);

    // Publish event (for analytics/monitoring)
    await this.messagingService.publish(EVENT_TOPICS.AUTH.SESSION_CREATED, {
      eventType: EVENT_TOPICS.AUTH.SESSION_CREATED,
      payload: {
        sessionId: 'temp', // Will be created after verification
        userId: 'temp',
        deviceId: dto.deviceId || 'unknown',
        expiresAt: expiresAt.toISOString(),
      },
    });

    const expiresInSeconds = Math.floor(
      (expiresAt.getTime() - Date.now()) / 1000,
    );

    return {
      success: true,
      message: `OTP sent to your ${dto.channel}`,
      expiresIn: expiresInSeconds,
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
    const identifier = dto.phone || dto.email;

    if (!identifier) {
      throw new BadRequestException('Phone or email is required');
    }

    const purpose = 'signup'; // You can determine this from context

    // Verify OTP
    await this.otpService.verifyOtp(identifier, dto.code, purpose);

    return ResponseUtils.success(
      { verified: true },
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
    // This endpoint assumes user already exists and OTP is verified
    // In a real scenario, you'd verify OTP first, then get user info from User Service

    const ipAddress = dto.ipAddress || req.ip;
    const userAgent = req.headers['user-agent'] || '';

    // Register device
    const device = await this.deviceService.registerDevice(
      'temp-user-id', // TODO: Get actual user ID from User Service
      dto.deviceId,
      userAgent,
      ipAddress,
      dto.deviceName,
    );

    // Check if device is blocked
    if (device.isBlocked) {
      throw new UnauthorizedException('This device has been blocked');
    }

    // Check for suspicious activity
    const isSuspicious = await this.deviceService.checkSuspiciousActivity(
      'temp-user-id',
      ipAddress,
    );

    if (isSuspicious) {
      // TODO: Send security alert, require additional verification
      console.log('Suspicious login attempt detected');
    }

    // Create session and generate tokens
    const { session, tokens } = await this.sessionService.createSession(
      'temp-user-id', // TODO: Get actual user ID
      dto.deviceId,
      ipAddress,
      userAgent,
    );

    // Publish login event
    await this.messagingService.publish(EVENT_TOPICS.AUTH.USER_LOGIN, {
      eventType: EVENT_TOPICS.AUTH.USER_LOGIN,
      payload: {
        userId: 'temp-user-id',
        deviceId: dto.deviceId,
        ipAddress,
        loginMethod: dto.identifierType,
      },
    });

    const response: AuthResponse = {
      user: {
        id: 'temp-user-id',
        phone: dto.identifierType === 'phone' ? dto.identifier : undefined,
        email: dto.identifierType === 'email' ? dto.identifier : undefined,
        username: 'temp-username',
        status: 'active',
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
      sessionId: session.id,
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
    const tokens = await this.sessionService.refreshTokens(
      dto.refreshToken,
      dto.deviceId,
    );

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
  async logout(@Body() dto: LogoutDto): Promise<any> {
    await this.sessionService.revokeSession(dto.sessionId, 'logout');

    // Publish logout event
    await this.messagingService.publish(EVENT_TOPICS.AUTH.USER_LOGOUT, {
      eventType: EVENT_TOPICS.AUTH.USER_LOGOUT,
      payload: {
        userId: 'temp-user-id', // TODO: Get from session
        sessionId: dto.sessionId,
        deviceId: dto.deviceId || 'unknown',
      },
    });

    return ResponseUtils.success(null, 'Logged out successfully');
  }

  /**
   * Get current user's active sessions
   * GET /auth/sessions
   */
  @Get('sessions')
  async getSessions(@Req() req: Request): Promise<any> {
    // TODO: Get user ID from JWT guard
    const userId = 'temp-user-id';

    const sessions = await this.sessionService.getUserSessions(userId);

    return ResponseUtils.success(sessions, 'Sessions retrieved successfully');
  }

  /**
   * Revoke all sessions (logout from all devices)
   * POST /auth/sessions/revoke-all
   */
  @Post('sessions/revoke-all')
  @HttpCode(HttpStatus.OK)
  async revokeAllSessions(@Req() req: Request): Promise<any> {
    // TODO: Get user ID from JWT guard
    const userId = 'temp-user-id';

    await this.sessionService.revokeAllUserSessions(userId, 'security');

    return ResponseUtils.success(
      null,
      'All sessions revoked successfully',
    );
  }
}
