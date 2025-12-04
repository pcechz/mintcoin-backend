import { Controller, Get } from '@nestjs/common';
import { ReferralServiceService } from './referral-service.service';

@Controller()
export class ReferralServiceController {
  constructor(private readonly referralServiceService: ReferralServiceService) {}

  @Get()
  getHello(): string {
    return this.referralServiceService.getHello();
  }
}
