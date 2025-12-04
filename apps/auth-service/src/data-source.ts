import { DataSource } from 'typeorm';
import { Session } from './domain/entities/session.entity';
import { OtpCode } from './domain/entities/otp-code.entity';
import { DeviceInfo } from './domain/entities/device-info.entity';

/**
 * TypeORM Data Source Configuration for Auth Service
 *
 * This configuration is used for:
 * - Running migrations (yarn typeorm migration:generate/run)
 * - Database schema management
 * - CLI operations
 *
 * Note: The application uses TypeOrmModule.forRoot() in the module file,
 * which may have different configuration. This file is specifically for migrations.
 */
export const AuthDataSource = new DataSource({
  type: 'postgres',

  // Database connection settings - matches docker-compose.yml postgres config
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'app',
  password: process.env.DB_PASSWORD || 'app',
  database: 'auth_db', // Auth service database (created by init-db.sql)

  // Entity and migration paths
  entities: [Session, OtpCode, DeviceInfo],
  migrations: ['apps/auth-service/src/migrations/*.ts'],

  // Disable auto-sync (always use migrations for schema changes)
  synchronize: false,

  // Enable SQL logging in development
  logging: process.env.NODE_ENV === 'development',
});
