import {
  Injectable,
  UnauthorizedException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Session } from '../entities';
import { DateUtils } from '@app/common';

export interface JwtPayload {
  sub: string; // user ID
  deviceId: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a new session and generate tokens
   */
  async createSession(
    userId: string,
    deviceId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ session: Session; tokens: TokenPair }> {
    // Revoke old sessions for this device (optional - single device policy)
    // await this.revokeDeviceSessions(userId, deviceId);

    // Create session
    const session = this.sessionRepository.create({
      userId,
      deviceId,
      ipAddress,
      userAgent,
      isActive: true,
      expiresAt: DateUtils.addTime(7, 'day'), // Session valid for 7 days
      lastActivityAt: DateUtils.nowDate(),
      accessToken: '', // Will be set below
      refreshToken: '', // Will be set below
    });

    const savedSession = await this.sessionRepository.save(session);

    // Generate tokens
    const tokens = await this.generateTokens(userId, deviceId, savedSession.id);

    // Update session with tokens
    savedSession.accessToken = tokens.accessToken;
    savedSession.refreshToken = tokens.refreshToken;
    await this.sessionRepository.save(savedSession);

    this.logger.log(`Session created for user ${userId}, device ${deviceId}`);

    return { session: savedSession, tokens };
  }

  /**
   * Generate JWT access and refresh tokens
   */
  private async generateTokens(
    userId: string,
    deviceId: string,
    sessionId: string,
  ): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: userId,
      deviceId,
      sessionId,
    };

    const accessTokenExpiration = this.configService.get<string>('JWT_EXPIRATION', '24h');
    const refreshTokenExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d');

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: accessTokenExpiration,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshTokenExpiration,
    });

    // Parse expiration time in seconds
    const expiresIn = this.parseExpirationToSeconds(accessTokenExpiration);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Refresh tokens using refresh token
   */
  async refreshTokens(
    refreshToken: string,
    deviceId: string,
  ): Promise<{ tokens: TokenPair; session: Session }> {
    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Verify device ID matches
      if (payload.deviceId !== deviceId) {
        throw new UnauthorizedException('Device mismatch');
      }

      // Find session
      const session = await this.sessionRepository.findOne({
        where: {
          id: payload.sessionId,
          userId: payload.sub,
          isActive: true,
        },
      });

      if (!session) {
        throw new UnauthorizedException('Session not found or inactive');
      }

      // Check if session expired
      if (DateUtils.isPast(session.expiresAt)) {
        await this.revokeSession(session.id, session.userId, 'expired');
        throw new UnauthorizedException('Session expired');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(payload.sub, deviceId, session.id);

      // Update session
      session.accessToken = tokens.accessToken;
      session.refreshToken = tokens.refreshToken;
      session.lastActivityAt = DateUtils.nowDate();
      await this.sessionRepository.save(session);

      this.logger.log(`Tokens refreshed for user ${payload.sub}`);

      return { tokens, session };
    } catch (error) {
      this.logger.error('Token refresh failed', error.stack);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Validate access token and return payload
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      // Check if session is still active
      const session = await this.sessionRepository.findOne({
        where: {
          id: payload.sessionId,
          isActive: true,
        },
      });

      if (!session) {
        throw new UnauthorizedException('Session not found or inactive');
      }

      // Update last activity
      session.lastActivityAt = DateUtils.nowDate();
      await this.sessionRepository.save(session);

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Revoke a session
   */
  async revokeSession(
    sessionId: string,
    userId: string,
    reason: 'logout' | 'expired' | 'security' | 'admin',
  ): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, userId, isActive: true },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    session.isActive = false;
    session.revokedAt = DateUtils.nowDate();
    session.revokeReason = reason;
    await this.sessionRepository.save(session);

    this.logger.log(`Session ${sessionId} revoked (${reason})`);
  }

  /**
   * Revoke all sessions for a user
   */
  async revokeAllUserSessions(
    userId: string,
    reason: 'logout' | 'expired' | 'security' | 'admin',
  ): Promise<void> {
    await this.sessionRepository.update(
      { userId, isActive: true },
      {
        isActive: false,
        revokedAt: DateUtils.nowDate(),
        revokeReason: reason,
      },
    );

    this.logger.log(`All sessions revoked for user ${userId} (${reason})`);
  }

  /**
   * Revoke all sessions for a specific device
   */
  async revokeDeviceSessions(userId: string, deviceId: string): Promise<void> {
    await this.sessionRepository.update(
      { userId, deviceId, isActive: true },
      {
        isActive: false,
        revokedAt: DateUtils.nowDate(),
        revokeReason: 'security',
      },
    );
  }

  /**
   * Get active sessions for a user
   */
  async getUserSessions(userId: string): Promise<Session[]> {
    return this.sessionRepository.find({
      where: { userId, isActive: true },
      order: { lastActivityAt: 'DESC' },
    });
  }

  /**
   * Parse expiration string to seconds
   */
  private parseExpirationToSeconds(expiration: string): number {
    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1));

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 86400; // Default 1 day
    }
  }
}
