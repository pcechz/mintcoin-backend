import { NestFactory } from '@nestjs/core';
import { GiftServiceModule } from './gift-service.module';

async function bootstrap() {
  const app = await NestFactory.create(GiftServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
