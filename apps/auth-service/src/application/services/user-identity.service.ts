import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

export interface UserIdentity {
  id: string;
  phone?: string;
  email?: string;
  username?: string;
  status: string;
  lifecycleState?: string;
  profileCompletionPercent?: number;
  referralCode?: string;
  needsOnboarding?: boolean;
}

interface LookupPayload {
  identifier: string;
  identifierType: 'phone' | 'email';
  deviceId?: string;
  ipAddress?: string;
}

@Injectable()
export class UserIdentityService {
  private readonly logger = new Logger(UserIdentityService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getOrCreateUser(payload: LookupPayload): Promise<UserIdentity> {
    const existing = await this.lookupUser(payload);
    if (existing) {
      return existing;
    }

    return this.bootstrapUser(payload);
  }

  async recordLogin(userId: string, metadata: { deviceId?: string; ipAddress?: string }): Promise<void> {
    await this.postInternal('/users/internal/record-login', {
      userId,
      deviceId: metadata.deviceId,
      ipAddress: metadata.ipAddress,
    });
  }

  private async lookupUser(payload: LookupPayload): Promise<UserIdentity | null> {
    const response = await this.postInternal<{ user: UserIdentity | null }>(
      '/users/internal/lookup',
      payload,
    );

    return response.user ?? null;
  }

  private async bootstrapUser(payload: LookupPayload): Promise<UserIdentity> {
    const response = await this.postInternal<{ user: UserIdentity }>(
      '/users/internal/bootstrap',
      payload,
    );

    return response.user;
  }

  private async postInternal<T>(path: string, body: Record<string, any>): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(this.buildUrl(path), body, {
          headers: this.buildHeaders(),
        }),
      );

      if (!response.data?.success) {
        throw new ServiceUnavailableException('User service returned an error');
      }

      return response.data.data as T;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        this.logger.error(
          `User service error (${error.response.status})`,
          error.response.data,
        );
      } else {
        this.logger.error('Unable to reach user service', error as Error);
      }

      throw new ServiceUnavailableException('Unable to reach user service');
    }
  }

  private buildUrl(path: string): string {
    const baseUrl = this.configService.get<string>('USER_SERVICE_URL', 'http://localhost:3002');
    return `${baseUrl}${path}`;
  }

  private buildHeaders(): Record<string, string> {
    const apiKey = this.configService.get<string>('INTERNAL_API_KEY');

    if (!apiKey) {
      throw new ServiceUnavailableException('INTERNAL_API_KEY is not configured');
    }

    return {
      'x-internal-api-key': apiKey,
    };
  }
}
