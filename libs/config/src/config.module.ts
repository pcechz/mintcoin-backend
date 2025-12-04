import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.dev'], // adjust to your taste
      ignoreEnvFile: false,
      cache: true,
    }),
  ],
})
export class ConfigModule {}
