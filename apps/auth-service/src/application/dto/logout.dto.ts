import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class LogoutDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsOptional()
  deviceId?: string;
}
