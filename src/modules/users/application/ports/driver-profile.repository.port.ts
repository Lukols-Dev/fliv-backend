// src/modules/users/application/ports/driver-profile.repository.port.ts
import { DriverProfile } from '../../domain/entities/driver-profile.entity';
import { UserId } from '../../domain/value-objects/user-id.vo';

export const DRIVER_PROFILE_REPOSITORY = Symbol('DRIVER_PROFILE_REPOSITORY');

export interface CreateDriverProfileInput {
  userId: string;
  companyInternalId?: string;
}

export interface UpdateDriverProfileInput {
  companyInternalId?: string | null;
  visaExpiresAt?: Date | null;
  drivingLicenseExpiresAt?: Date | null;
  workPermitExpiresAt?: Date | null;
  medicalCheckExpiresAt?: Date | null;
  psychCheckExpiresAt?: Date | null;
  driverCardExpiresAt?: Date | null;
  residenceCardExpiresAt?: Date | null;
  driverCertificateExpiresAt?: Date | null;
}

export interface DriverProfileRepositoryPort {
  create(input: CreateDriverProfileInput): Promise<DriverProfile>;
  update(
    userId: UserId,
    input: UpdateDriverProfileInput,
  ): Promise<DriverProfile>;
  findByUserId(userId: UserId): Promise<DriverProfile | null>;
}
