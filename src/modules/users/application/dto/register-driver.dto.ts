import { IsOptional, IsString, Length } from 'class-validator';

export class RegisterDriverDto {
  @IsOptional()
  @IsString()
  @Length(1, 64)
  companyInternalId?: string;

  @IsOptional()
  @IsString()
  @Length(5, 32)
  phone?: string;
}
