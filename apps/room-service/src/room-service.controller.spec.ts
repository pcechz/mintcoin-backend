import { Test, TestingModule } from '@nestjs/testing';
import { RoomServiceController } from './room-service.controller';
import { RoomServiceService } from './room-service.service';

describe('RoomServiceController', () => {
  let roomServiceController: RoomServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RoomServiceController],
      providers: [RoomServiceService],
    }).compile();

    roomServiceController = app.get<RoomServiceController>(RoomServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(roomServiceController.getHello()).toBe('Hello World!');
    });
  });
});
