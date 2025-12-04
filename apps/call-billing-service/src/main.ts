import { NestFactory } from '@nestjs/core';
import { CallBillingServiceModule } from './call-billing-service.module';

async function bootstrap() {
  const app = await NestFactory.create(CallBillingServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
