import {
  // BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepositoryPort,
} from '../ports/user.repository.port';
import {
  DRIVER_PROFILE_REPOSITORY,
  type DriverProfileRepositoryPort,
} from '../ports/driver-profile.repository.port';
import {
  ROLE_REPOSITORY,
  type RoleRepositoryPort,
} from '../ports/role.repository.port';
import { ROLE_DRIVER } from 'src/shared/constants/roles.constants';
import { RegisterDriverDto } from '../dto/register-driver.dto';
import { UserId } from '../../domain/value-objects/user-id.vo';

export interface RegisterDriverInput {
  currentUserId: string;
  payload: RegisterDriverDto;
}

@Injectable()
export class RegisterDriverUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(DRIVER_PROFILE_REPOSITORY)
    private readonly driverProfileRepository: DriverProfileRepositoryPort,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepositoryPort,
  ) {}

  async execute(input: RegisterDriverInput): Promise<void> {
    const userId = new UserId(input.currentUserId);

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    // if (!user.isActive) {
    //   throw new BadRequestException('Account is not active');
    // }

    // 1. Update basic user data (names, phone, consents)
    await this.userRepository.update(userId, {
      firstName: input.payload.firstName,
      lastName: input.payload.lastName,
      phone: input.payload.phone,
      isAgreedToTerms: input.payload.isAgreedToTerms,
      isAgreedToPrivacyPolicy: input.payload.isAgreedToPrivacyPolicy,
    });

    // 2. Ensure DRIVER role exists and assign it
    await this.roleRepository.ensureRoleExists(ROLE_DRIVER);
    await this.roleRepository.assignRoleToUser(userId, ROLE_DRIVER);

    // 3. Create DriverProfile (if it does not exist)
    const existingProfile =
      await this.driverProfileRepository.findByUserId(userId);

    if (!existingProfile) {
      await this.driverProfileRepository.create({
        userId: userId.value,
        companyInternalId: input.payload.companyInternalId,
      });
    } else {
      await this.driverProfileRepository.update(userId, {
        companyInternalId:
          input.payload.companyInternalId ?? existingProfile.companyInternalId,
      });
    }
  }
}
