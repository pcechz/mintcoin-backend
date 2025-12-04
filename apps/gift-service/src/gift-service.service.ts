import { Injectable } from '@nestjs/common';

@Injectable()
export class GiftServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
