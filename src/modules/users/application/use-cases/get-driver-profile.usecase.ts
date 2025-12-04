import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepositoryPort,
} from '../ports/user.repository.port';
import { UserId } from '../../domain/value-objects/user-id.vo';
import {
  DRIVER_PROFILE_REPOSITORY,
  DriverProfileRepositoryPort,
} from '../ports/driver-profile.repository.port';

export interface DriverProfileResult {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  isActive: boolean;
  roles: string[];
  driverProfile: {
    companyInternalId: string | null;
    driverCode: string | null;
    visaExpiresAt: Date | null;
    drivingLicenseExpiresAt: Date | null;
    workPermitExpiresAt: Date | null;
    medicalCheckExpiresAt: Date | null;
    psychCheckExpiresAt: Date | null;
    driverCardExpiresAt: Date | null;
    residenceCardExpiresAt: Date | null;
    driverCertificateExpiresAt: Date | null;
  } | null;
}

@Injectable()
export class GetDriverProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(DRIVER_PROFILE_REPOSITORY)
    private readonly driverProfileRepository: DriverProfileRepositoryPort,
  ) {}

  async execute(currentUserId: string): Promise<DriverProfileResult> {
    const userId = new UserId(currentUserId);

    const [user, driverProfile] = await Promise.all([
      this.userRepository.findWithRolesById(userId),
      this.driverProfileRepository.findByUserId(userId),
    ]);

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      phone: user.phone ?? null,
      isActive: user.isActive,
      roles: user.roles,
      driverProfile: driverProfile
        ? {
            companyInternalId: driverProfile.companyInternalId ?? null,
            driverCode: driverProfile.driverId.toString(),
            visaExpiresAt: driverProfile.visaExpiresAt ?? null,
            drivingLicenseExpiresAt:
              driverProfile.drivingLicenseExpiresAt ?? null,
            workPermitExpiresAt: driverProfile.workPermitExpiresAt ?? null,
            medicalCheckExpiresAt: driverProfile.medicalCheckExpiresAt ?? null,
            psychCheckExpiresAt: driverProfile.psychCheckExpiresAt ?? null,
            driverCardExpiresAt: driverProfile.driverCardExpiresAt ?? null,
            residenceCardExpiresAt:
              driverProfile.residenceCardExpiresAt ?? null,
            driverCertificateExpiresAt:
              driverProfile.driverCertificateExpiresAt ?? null,
          }
        : null,
    };
  }
}
