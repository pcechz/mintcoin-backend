import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserServiceModule } from './user-service.module';

/**
 * Bootstrap the User Service
 * Handles user profiles, lifecycle management, and referrals
 */
async function bootstrap() {
  const app = await NestFactory.create(UserServiceModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('UserService');

  // Enable CORS for frontend communication
  app.enableCors({
    origin: configService.get('CORS_ORIGINS', '*').split(','),
    credentials: true,
  });

  // Enable global validation pipe for DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to DTO instances
    }),
  );

  // Get port from environment configuration
  const port = configService.get<number>('USER_SERVICE_PORT', 3002);

  await app.listen(port);

  logger.log(`🚀 User Service is running on: http://localhost:${port}`);
  logger.log(`📍 Environment: ${configService.get('NODE_ENV', 'development')}`);
  logger.log(`👤 Endpoints: http://localhost:${port}/users/*`);
}

bootstrap();
