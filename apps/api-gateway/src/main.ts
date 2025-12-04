import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  const config = app.get(ConfigService);

  // Port Configuration
  const port = config.get<number>('PORT', 3000);

  // CORS Configuration
  const corsOrigins = config.get<string>('CORS_ORIGINS', '*').split(',');
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Id', 'X-Request-Id'],
  });

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for development
    crossOriginEmbedderPolicy: false,
  }));

  // Global API Prefix
  app.setGlobalPrefix('api/v1');

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger/OpenAPI Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('MintCoin API Gateway')
    .setDescription('MintCoin Backend API Documentation - Comprehensive API for social media platform with video calls, rooms, gifts, and wallet management')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication and session management')
    .addTag('Users', 'User profile and account management')
    .addTag('Wallet', 'Digital wallet and coin balance operations')
    .addTag('Payments', 'Payment processing and transactions')
    .addTag('Rooms', 'Audio/video rooms and live streaming')
    .addTag('Calls', 'One-on-one video calls')
    .addTag('Gifts', 'Virtual gifts and tipping')
    .addTag('Chat', 'Messaging and chat features')
    .addTag('Social', 'Follow, friend requests, and social interactions')
    .addTag('Discovery', 'User discovery and search')
    .addTag('KYC', 'Know Your Customer verification')
    .addTag('Referrals', 'Referral program and rewards')
    .addTag('Notifications', 'Push notifications and alerts')
    .addTag('Analytics', 'User analytics and insights')
    .addTag('Admin', 'Administrative operations')
    .addServer(`http://localhost:${port}`, 'Local Development')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  await app.listen(port);
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                    MintCoin API Gateway                     ║
╠════════════════════════════════════════════════════════════╣
║  🚀 Server running on: http://localhost:${port}            ║
║  📚 API Documentation: http://localhost:${port}/api/docs   ║
║  🔧 Environment: ${config.get('NODE_ENV', 'development')}  ║
╚════════════════════════════════════════════════════════════╝
  `);
}
bootstrap();
