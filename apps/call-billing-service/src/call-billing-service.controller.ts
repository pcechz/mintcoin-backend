import { Controller, Get } from '@nestjs/common';
import { CallBillingServiceService } from './call-billing-service.service';

@Controller()
export class CallBillingServiceController {
  constructor(private readonly callBillingServiceService: CallBillingServiceService) {}

  @Get()
  getHello(): string {
    return this.callBillingServiceService.getHello();
  }
}
