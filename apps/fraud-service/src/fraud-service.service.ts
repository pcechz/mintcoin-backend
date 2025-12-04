import { Injectable } from '@nestjs/common';

@Injectable()
export class FraudServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
