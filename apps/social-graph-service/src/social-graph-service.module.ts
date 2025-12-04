import { Module } from '@nestjs/common';
import { SocialGraphServiceController } from './social-graph-service.controller';
import { SocialGraphServiceService } from './social-graph-service.service';

@Module({
  imports: [],
  controllers: [SocialGraphServiceController],
  providers: [SocialGraphServiceService],
})
export class SocialGraphServiceModule {}
