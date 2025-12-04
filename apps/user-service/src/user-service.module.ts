import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PersistenceModule } from '@app/persistence';
import { MessagingModule } from '@app/messaging';
import { User } from './domain/entities';
import { UserService } from './application/services';
import { UserController } from './interfaces/rest';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.dev'],
    }),
    PersistenceModule,
    MessagingModule,
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserServiceModule {}
