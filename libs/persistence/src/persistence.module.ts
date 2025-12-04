import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * Determines the appropriate database name for the current service
 * Uses SERVICE_DB_NAME if set, otherwise falls back to DB_NAME
 */
function getDatabaseName(config: ConfigService): string {
  // Check for SERVICE_DB_NAME first (set by service startup script)
  const serviceDbName = config.get<string>('SERVICE_DB_NAME');
  if (serviceDbName) {
    return serviceDbName;
  }

  // Fall back to generic DB_NAME
  return config.get<string>('DB_NAME', 'app_db');
}

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
        database: getDatabaseName(config),
        autoLoadEntities: true,
        synchronize: false, // migrations only in real env
        logging: config.get<string>('DB_LOGGING') === 'true',
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class PersistenceModule {}
