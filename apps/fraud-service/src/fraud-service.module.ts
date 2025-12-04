import { Module } from '@nestjs/common';
import { FraudServiceController } from './fraud-service.controller';
import { FraudServiceService } from './fraud-service.service';

@Module({
  imports: [],
  controllers: [FraudServiceController],
  providers: [FraudServiceService],
})
export class FraudServiceModule {}
