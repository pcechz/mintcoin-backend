import { Module } from '@nestjs/common';
import { CallBillingServiceController } from './call-billing-service.controller';
import { CallBillingServiceService } from './call-billing-service.service';

@Module({
  imports: [],
  controllers: [CallBillingServiceController],
  providers: [CallBillingServiceService],
})
export class CallBillingServiceModule {}
