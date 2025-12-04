import { Injectable } from '@nestjs/common';

@Injectable()
export class SocialGraphServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
