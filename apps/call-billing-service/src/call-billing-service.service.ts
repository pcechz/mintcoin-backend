import { Injectable } from '@nestjs/common';

@Injectable()
export class CallBillingServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
