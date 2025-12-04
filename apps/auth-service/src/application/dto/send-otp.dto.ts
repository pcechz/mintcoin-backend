import {
  IsString,
  IsEnum,
  IsOptional,
  Matches,
  IsEmail,
  ValidateIf,
} from 'class-validator';

export class SendOtpDto {
  @ValidateIf((dto) => dto.identifierType === 'phone')
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in valid international format',
  })
  phone?: string;

  @ValidateIf((dto) => dto.identifierType === 'email')
  @IsEmail()
  email?: string;

  @IsEnum(['phone', 'email'])
  identifierType: 'phone' | 'email';

  @IsEnum(['signup', 'login', 'password_reset'])
  purpose: 'signup' | 'login' | 'password_reset';

  @IsString()
  @IsOptional()
  deviceId?: string;
}
