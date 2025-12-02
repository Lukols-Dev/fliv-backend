import { DriverId } from '../value-objects/driver-id.vo';
import { UserId } from '../value-objects/user-id.vo';

export class DriverProfile {
  constructor(
    public readonly userId: UserId,
    public readonly driverId: DriverId,
    public companyInternalId: string | null,
    public visaExpiresAt: Date | null,
    public drivingLicenseExpiresAt: Date | null,
    public workPermitExpiresAt: Date | null,
    public medicalCheckExpiresAt: Date | null,
    public psychCheckExpiresAt: Date | null,
    public driverCardExpiresAt: Date | null,
    public residenceCardExpiresAt: Date | null,
    public driverCertificateExpiresAt: Date | null,
  ) {}
}
