import { NestFactory } from '@nestjs/core';
import { FraudServiceModule } from './fraud-service.module';

async function bootstrap() {
  const app = await NestFactory.create(FraudServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
