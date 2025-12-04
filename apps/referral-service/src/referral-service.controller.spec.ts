import { Test, TestingModule } from '@nestjs/testing';
import { ReferralServiceController } from './referral-service.controller';
import { ReferralServiceService } from './referral-service.service';

describe('ReferralServiceController', () => {
  let referralServiceController: ReferralServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ReferralServiceController],
      providers: [ReferralServiceService],
    }).compile();

    referralServiceController = app.get<ReferralServiceController>(ReferralServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(referralServiceController.getHello()).toBe('Hello World!');
    });
  });
});
