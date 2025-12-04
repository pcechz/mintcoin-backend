import { NestFactory } from '@nestjs/core';
import { DiscoveryServiceModule } from './discovery-service.module';

async function bootstrap() {
  const app = await NestFactory.create(DiscoveryServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
