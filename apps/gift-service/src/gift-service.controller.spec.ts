import { Test, TestingModule } from '@nestjs/testing';
import { GiftServiceController } from './gift-service.controller';
import { GiftServiceService } from './gift-service.service';

describe('GiftServiceController', () => {
  let giftServiceController: GiftServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GiftServiceController],
      providers: [GiftServiceService],
    }).compile();

    giftServiceController = app.get<GiftServiceController>(GiftServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(giftServiceController.getHello()).toBe('Hello World!');
    });
  });
});
