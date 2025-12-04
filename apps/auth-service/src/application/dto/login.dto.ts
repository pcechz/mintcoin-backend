import { IsString, IsNotEmpty, IsOptional, IsEnum, Length } from 'class-validator';

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

  @IsString()
  @Length(32, 128)
  verificationToken: string;

  @IsEnum(['signup', 'login', 'password_reset'])
  @IsOptional()
  purpose?: 'signup' | 'login' | 'password_reset';
}
