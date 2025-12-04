import { Test, TestingModule } from '@nestjs/testing';
import { CallBillingServiceController } from './call-billing-service.controller';
import { CallBillingServiceService } from './call-billing-service.service';

describe('CallBillingServiceController', () => {
  let callBillingServiceController: CallBillingServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CallBillingServiceController],
      providers: [CallBillingServiceService],
    }).compile();

    callBillingServiceController = app.get<CallBillingServiceController>(CallBillingServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(callBillingServiceController.getHello()).toBe('Hello World!');
    });
  });
});
