import { Injectable } from '@nestjs/common';

@Injectable()
export class ReferralServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
