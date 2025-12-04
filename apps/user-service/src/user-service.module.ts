import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PersistenceModule } from '@app/persistence';
import { MessagingModule } from '@app/messaging';
import { JwtAuthGuard } from '@app/guards';
import { User } from './domain/entities';
import { UserService } from './application/services';
import { UserController, InternalUserController } from './interfaces/rest';
import { InternalApiGuard } from './interfaces/guards/internal-api.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.dev'],
    }),
    PersistenceModule,
    MessagingModule,
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
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController, InternalUserController],
  providers: [UserService, JwtAuthGuard, InternalApiGuard],
  exports: [UserService],
})
export class UserServiceModule {}
