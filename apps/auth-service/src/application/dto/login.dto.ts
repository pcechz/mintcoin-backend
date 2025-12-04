import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  identifier: string; // phone or email

  @IsEnum(['phone', 'email'])
  identifierType: 'phone' | 'email';

  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsString()
  @IsOptional()
  deviceName?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;
}
