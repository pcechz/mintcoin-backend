import { Controller, Get } from '@nestjs/common';
import { DiscoveryServiceService } from './discovery-service.service';

@Controller()
export class DiscoveryServiceController {
  constructor(private readonly discoveryServiceService: DiscoveryServiceService) {}

  @Get()
  getHello(): string {
    return this.discoveryServiceService.getHello();
  }
}
