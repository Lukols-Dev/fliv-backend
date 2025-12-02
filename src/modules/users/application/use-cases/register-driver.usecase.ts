import { Inject, Injectable } from '@nestjs/common';
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

    const user = await this.userRepository.findById(userId.value);
    if (!user) {
      throw new Error('User does not exist');
    }

    // Driver must be active to use the application
    if (!user.isActive) {
      throw new Error('Account is not active');
    }

    // 1. Ensure that the DRIVER role exists
    await this.roleRepository.ensureRoleExists(ROLE_DRIVER);

    // 2. Assign the DRIVER role
    await this.roleRepository.assignRoleToUser(userId.value, ROLE_DRIVER);

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

    // You can also save the phone in the User through another use-case / updateUser
    if (input.payload.phone) {
      await this.userRepository.update(userId.value, {
        phone: input.payload.phone,
      });
    }
  }
}
