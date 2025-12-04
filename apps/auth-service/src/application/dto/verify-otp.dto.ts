import {
  IsString,
  IsNotEmpty,
  Length,
  Matches,
  IsEmail,
  IsOptional,
  IsEnum,
  ValidateIf,
} from 'class-validator';

export class VerifyOtpDto {
  @ValidateIf((dto) => dto.identifierType === 'phone')
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/)
  phone?: string;

  @ValidateIf((dto) => dto.identifierType === 'email')
  @IsEmail()
  email?: string;

  @IsEnum(['phone', 'email'])
  identifierType: 'phone' | 'email';

  @IsEnum(['signup', 'login', 'password_reset'])
  purpose: 'signup' | 'login' | 'password_reset';

  @IsString()
  @IsNotEmpty()
  @Length(4, 10)
  code: string;

  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsString()
  @IsOptional()
  deviceName?: string;
}
