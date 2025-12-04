import { Test, TestingModule } from '@nestjs/testing';
import { SocialGraphServiceController } from './social-graph-service.controller';
import { SocialGraphServiceService } from './social-graph-service.service';

describe('SocialGraphServiceController', () => {
  let socialGraphServiceController: SocialGraphServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SocialGraphServiceController],
      providers: [SocialGraphServiceService],
    }).compile();

    socialGraphServiceController = app.get<SocialGraphServiceController>(SocialGraphServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(socialGraphServiceController.getHello()).toBe('Hello World!');
    });
  });
});
