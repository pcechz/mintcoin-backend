import { Injectable } from '@nestjs/common';

@Injectable()
export class DiscoveryServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
