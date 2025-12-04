import { Controller, Get } from '@nestjs/common';
import { SocialGraphServiceService } from './social-graph-service.service';

@Controller()
export class SocialGraphServiceController {
  constructor(private readonly socialGraphServiceService: SocialGraphServiceService) {}

  @Get()
  getHello(): string {
    return this.socialGraphServiceService.getHello();
  }
}
