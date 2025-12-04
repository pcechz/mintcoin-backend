import { Injectable } from '@nestjs/common';

@Injectable()
export class RoomServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
