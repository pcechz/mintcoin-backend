import { Controller, Get } from '@nestjs/common';
import { GiftServiceService } from './gift-service.service';

@Controller()
export class GiftServiceController {
  constructor(private readonly giftServiceService: GiftServiceService) {}

  @Get()
  getHello(): string {
    return this.giftServiceService.getHello();
  }
}
