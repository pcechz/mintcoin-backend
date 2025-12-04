import { NestFactory } from '@nestjs/core';
import { RoomServiceModule } from './room-service.module';

async function bootstrap() {
  const app = await NestFactory.create(RoomServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
