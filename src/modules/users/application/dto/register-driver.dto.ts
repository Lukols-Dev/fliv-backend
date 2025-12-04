import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class RegisterDriverDto {
  @IsOptional()
  @IsString()
  @Length(1, 64)
  companyInternalId?: string;

  @IsOptional()
  @IsString()
  @Length(5, 32)
  phone?: string;

  @IsString()
  @Length(1, 64)
  firstName!: string;

  @IsString()
  @Length(1, 64)
  lastName!: string;

  @IsBoolean()
  isAgreedToTerms!: boolean;

  @IsBoolean()
  isAgreedToPrivacyPolicy!: boolean;
}
