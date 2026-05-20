import { Injectable } from '@nestjs/common';
import {
  DriverProfileRepositoryPort,
  CreateDriverProfileInput,
  UpdateDriverProfileInput,
} from '../../application/ports/driver-profile.repository.port';
import { DriverProfile } from '../../domain/entities/driver-profile.entity';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { DriverId } from '../../domain/value-objects/driver-id.vo';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class DriverProfilePrismaRepository
  implements DriverProfileRepositoryPort
{
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(record: {
    userId: string;
    driverCode: string;
    companyInternalId: string | null;
    visaExpiresAt: Date | null;
    drivingLicenseExpiresAt: Date | null;
    workPermitExpiresAt: Date | null;
    medicalCheckExpiresAt: Date | null;
    psychCheckExpiresAt: Date | null;
    driverCardExpiresAt: Date | null;
    residenceCardExpiresAt: Date | null;
    driverCertificateExpiresAt: Date | null;
  }): DriverProfile {
    return new DriverProfile(
      new UserId(record.userId),
      new DriverId(record.driverCode),
      record.companyInternalId,
      record.visaExpiresAt,
      record.drivingLicenseExpiresAt,
      record.workPermitExpiresAt,
      record.medicalCheckExpiresAt,
      record.psychCheckExpiresAt,
      record.driverCardExpiresAt,
      record.residenceCardExpiresAt,
      record.driverCertificateExpiresAt,
    );
  }

  async create(input: CreateDriverProfileInput): Promise<DriverProfile> {
    const driverCode = `DRV-${crypto.randomUUID()}`;

    const created = await this.prisma.driverProfile.create({
      data: {
        userId: input.userId,
        companyInternalId: input.companyInternalId ?? null,
        driverCode,
      },
    });

    return this.toDomain(created);
  }

  async update(
    userId: UserId,
    input: UpdateDriverProfileInput,
  ): Promise<DriverProfile> {
    const updated = await this.prisma.driverProfile.update({
      where: { userId: userId.value },
      data: {
        companyInternalId: input.companyInternalId,
        visaExpiresAt: input.visaExpiresAt,
        drivingLicenseExpiresAt: input.drivingLicenseExpiresAt,
        workPermitExpiresAt: input.workPermitExpiresAt,
        medicalCheckExpiresAt: input.medicalCheckExpiresAt,
        psychCheckExpiresAt: input.psychCheckExpiresAt,
        driverCardExpiresAt: input.driverCardExpiresAt,
        residenceCardExpiresAt: input.residenceCardExpiresAt,
        driverCertificateExpiresAt: input.driverCertificateExpiresAt,
      },
    });

    return this.toDomain(updated);
  }

  async findByUserId(userId: UserId): Promise<DriverProfile | null> {
    const record = await this.prisma.driverProfile.findUnique({
      where: { userId: userId.value },
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async deleteByUserId(userId: UserId): Promise<void> {
    await this.prisma.driverProfile.deleteMany({
      where: { userId: userId.value },
    });
  }
}
