import { Controller, Get } from '@nestjs/common';
import { RoomServiceService } from './room-service.service';

@Controller()
export class RoomServiceController {
  constructor(private readonly roomServiceService: RoomServiceService) {}

  @Get()
  getHello(): string {
    return this.roomServiceService.getHello();
  }
}
