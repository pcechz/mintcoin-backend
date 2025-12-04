import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PersistenceModule } from '@app/persistence';
import { MessagingModule } from '@app/messaging';
import { JwtAuthGuard } from '@app/guards';
import { Session, OtpCode, DeviceInfo } from './domain/entities';
import { OtpService, SessionService, DeviceService } from './domain/services';
import { UserIdentityService } from './application/services';
import { AuthController } from './interfaces/rest';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.dev'],
    }),
    PersistenceModule,
    MessagingModule,
    HttpModule,
    TypeOrmModule.forFeature([Session, OtpCode, DeviceInfo]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRATION', '24h'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [OtpService, SessionService, DeviceService, UserIdentityService, JwtAuthGuard],
  exports: [OtpService, SessionService, DeviceService],
})
export class AuthServiceModule {}
