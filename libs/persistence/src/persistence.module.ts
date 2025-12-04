import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
        username: config.get<string>('DB_USER', 'app'),
        password: config.get<string>('DB_PASSWORD', 'app'),
        database: config.get<string>('DB_NAME', 'app_db'),
        autoLoadEntities: true,
        synchronize: false, // migrations only in real env
        logging: config.get<string>('DB_LOGGING') === 'true',
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class PersistenceModule {}
