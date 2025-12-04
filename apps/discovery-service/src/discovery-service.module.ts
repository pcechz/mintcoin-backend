import { Module } from '@nestjs/common';
import { DiscoveryServiceController } from './discovery-service.controller';
import { DiscoveryServiceService } from './discovery-service.service';

@Module({
  imports: [],
  controllers: [DiscoveryServiceController],
  providers: [DiscoveryServiceService],
})
export class DiscoveryServiceModule {}
