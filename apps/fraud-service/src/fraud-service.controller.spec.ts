import { Test, TestingModule } from '@nestjs/testing';
import { FraudServiceController } from './fraud-service.controller';
import { FraudServiceService } from './fraud-service.service';

describe('FraudServiceController', () => {
  let fraudServiceController: FraudServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FraudServiceController],
      providers: [FraudServiceService],
    }).compile();

    fraudServiceController = app.get<FraudServiceController>(FraudServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(fraudServiceController.getHello()).toBe('Hello World!');
    });
  });
});
