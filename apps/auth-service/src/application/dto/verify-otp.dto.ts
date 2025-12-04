import { IsString, IsNotEmpty, Length, Matches, IsEmail, IsOptional } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/)
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

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
