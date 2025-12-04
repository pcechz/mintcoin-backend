import { Module } from '@nestjs/common';
import { ReferralServiceController } from './referral-service.controller';
import { ReferralServiceService } from './referral-service.service';

@Module({
  imports: [],
  controllers: [ReferralServiceController],
  providers: [ReferralServiceService],
})
export class ReferralServiceModule {}
