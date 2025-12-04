import { Module } from '@nestjs/common';
import { GiftServiceController } from './gift-service.controller';
import { GiftServiceService } from './gift-service.service';

@Module({
  imports: [],
  controllers: [GiftServiceController],
  providers: [GiftServiceService],
})
export class GiftServiceModule {}
