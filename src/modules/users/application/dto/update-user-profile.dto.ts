import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  @Length(1, 64)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  lastName?: string;

  @IsOptional()
  @IsString()
  @Length(5, 32)
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isAgreedToTerms?: boolean;

  @IsOptional()
  @IsBoolean()
  isAgreedToPrivacyPolicy?: boolean;
}
