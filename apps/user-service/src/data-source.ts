import { DataSource } from 'typeorm';
import { User } from './domain/entities/user.entity';

/**
 * TypeORM Data Source Configuration for User Service
 *
 * This configuration is used for:
 * - Running migrations (yarn typeorm migration:generate/run)
 * - Database schema management
 * - CLI operations
 *
 * Note: The application uses TypeOrmModule.forRoot() in the module file,
 * which may have different configuration. This file is specifically for migrations.
 */
export const UserDataSource = new DataSource({
  type: 'postgres',

  // Database connection settings - matches docker-compose.yml postgres config
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'app',
  password: process.env.DB_PASSWORD || 'app',
  database: 'user_db', // User service database (created by init-db.sql)

  // Entity and migration paths
  entities: [User],
  migrations: ['apps/user-service/src/migrations/*.ts'],

  // Disable auto-sync (always use migrations for schema changes)
  synchronize: false,

  // Enable SQL logging in development
  logging: process.env.NODE_ENV === 'development',
});
