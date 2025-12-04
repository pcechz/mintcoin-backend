import { IsString, IsEnum, IsOptional, Matches, IsEmail } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in valid international format',
  })
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(['phone', 'email'])
  channel: 'phone' | 'email';

  @IsEnum(['signup', 'login', 'password_reset'])
  purpose: 'signup' | 'login' | 'password_reset';

  @IsString()
  @IsOptional()
  deviceId?: string;
}
