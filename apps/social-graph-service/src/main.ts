import { NestFactory } from '@nestjs/core';
import { SocialGraphServiceModule } from './social-graph-service.module';

async function bootstrap() {
  const app = await NestFactory.create(SocialGraphServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
