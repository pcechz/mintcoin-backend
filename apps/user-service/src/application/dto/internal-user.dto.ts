import { IsString, IsEnum, IsOptional } from 'class-validator';

export class LookupUserByIdentifierDto {
  @IsString()
  identifier: string;

  @IsEnum(['phone', 'email'])
  identifierType: 'phone' | 'email';

  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;
}

export class BootstrapUserDto extends LookupUserByIdentifierDto {}

export class RecordLoginActivityDto {
  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;
}
