import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsArray,
  Length,
  Matches,
  IsDateString,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/)
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @Length(3, 50)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username: string;

  @IsString()
  @Length(2, 255)
  name: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  @Length(0, 500)
  bio?: string;

  @IsEnum(['male', 'female', 'other', 'prefer_not_to_say'])
  @IsOptional()
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';

  @IsEnum(['18-24', '25-34', '35-44', '45-54', '55+'])
  @IsOptional()
  ageBracket?: '18-24' | '25-34' | '35-44' | '45-54' | '55+';

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  interests?: string[];

  @IsString()
  @IsOptional()
  referredByCode?: string;

  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;
}
