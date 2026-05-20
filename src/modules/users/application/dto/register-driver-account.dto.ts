import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class RegisterDriverAccountDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(8, 128)
  password!: string;

  @IsString()
  @Length(1, 64)
  firstName!: string;

  @IsString()
  @Length(1, 64)
  lastName!: string;

  @IsString()
  @Length(1, 64)
  companyInternalId!: string;

  @IsOptional()
  @IsString()
  @Length(5, 32)
  phone?: string;

  @IsBoolean()
  isAgreedToTerms!: boolean;

  @IsBoolean()
  isAgreedToPrivacyPolicy!: boolean;
}
