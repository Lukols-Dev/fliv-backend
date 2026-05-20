import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class RegisterUserProfileDto {
  @IsString()
  @Length(1, 64)
  firstName!: string;

  @IsString()
  @Length(1, 64)
  lastName!: string;

  @IsOptional()
  @IsString()
  @Length(5, 32)
  phone?: string;

  @IsBoolean()
  isAgreedToTerms!: boolean;

  @IsBoolean()
  isAgreedToPrivacyPolicy!: boolean;
}
