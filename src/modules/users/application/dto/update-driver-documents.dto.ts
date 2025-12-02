import { IsDateString, IsOptional, IsString, Length } from 'class-validator';

export class UpdateDriverDto {
  @IsOptional()
  @IsString()
  @Length(1, 64)
  companyInternalId?: string | null;

  @IsOptional()
  @IsDateString()
  visaExpiresAt?: string | null;

  @IsOptional()
  @IsDateString()
  drivingLicenseExpiresAt?: string | null;

  @IsOptional()
  @IsDateString()
  workPermitExpiresAt?: string | null;

  @IsOptional()
  @IsDateString()
  medicalCheckExpiresAt?: string | null;

  @IsOptional()
  @IsDateString()
  psychCheckExpiresAt?: string | null;

  @IsOptional()
  @IsDateString()
  driverCardExpiresAt?: string | null;

  @IsOptional()
  @IsDateString()
  residenceCardExpiresAt?: string | null;

  @IsOptional()
  @IsDateString()
  driverCertificateExpiresAt?: string | null;
}
