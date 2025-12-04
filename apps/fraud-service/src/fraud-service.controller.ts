import { Controller, Get } from '@nestjs/common';
import { FraudServiceService } from './fraud-service.service';

@Controller()
export class FraudServiceController {
  constructor(private readonly fraudServiceService: FraudServiceService) {}

  @Get()
  getHello(): string {
    return this.fraudServiceService.getHello();
  }
}
