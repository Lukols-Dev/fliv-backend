import { Inject, Injectable } from '@nestjs/common';
import {
  DRIVER_PROFILE_REPOSITORY,
  type DriverProfileRepositoryPort,
} from '../ports/driver-profile.repository.port';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { UpdateDriverDto } from '../dto/update-driver-documents.dto';

export interface UpdateDriverInput {
  currentUserId: string;
  payload: UpdateDriverDto;
}

@Injectable()
export class UpdateDriverUseCase {
  constructor(
    @Inject(DRIVER_PROFILE_REPOSITORY)
    private readonly driverProfileRepository: DriverProfileRepositoryPort,
  ) {}

  async execute(input: UpdateDriverInput): Promise<void> {
    const userId = new UserId(input.currentUserId);

    await this.driverProfileRepository.update(userId, {
      companyInternalId: input.payload.companyInternalId ?? null,
      visaExpiresAt: input.payload.visaExpiresAt
        ? new Date(input.payload.visaExpiresAt)
        : undefined,
      drivingLicenseExpiresAt: input.payload.drivingLicenseExpiresAt
        ? new Date(input.payload.drivingLicenseExpiresAt)
        : undefined,
      workPermitExpiresAt: input.payload.workPermitExpiresAt
        ? new Date(input.payload.workPermitExpiresAt)
        : undefined,
      medicalCheckExpiresAt: input.payload.medicalCheckExpiresAt
        ? new Date(input.payload.medicalCheckExpiresAt)
        : undefined,
      psychCheckExpiresAt: input.payload.psychCheckExpiresAt
        ? new Date(input.payload.psychCheckExpiresAt)
        : undefined,
      driverCardExpiresAt: input.payload.driverCardExpiresAt
        ? new Date(input.payload.driverCardExpiresAt)
        : undefined,
      residenceCardExpiresAt: input.payload.residenceCardExpiresAt
        ? new Date(input.payload.residenceCardExpiresAt)
        : undefined,
      driverCertificateExpiresAt: input.payload.driverCertificateExpiresAt
        ? new Date(input.payload.driverCertificateExpiresAt)
        : undefined,
    });
  }
}
