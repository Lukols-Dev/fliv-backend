import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserId } from '../../domain/value-objects/user-id.vo';
import {
  DRIVER_PROFILE_REPOSITORY,
  type DriverProfileRepositoryPort,
} from '../ports/driver-profile.repository.port';
import {
  ROLE_REPOSITORY,
  type RoleRepositoryPort,
} from '../ports/role.repository.port';
import { ROLE_DRIVER } from 'src/shared/constants/roles.constants';

@Injectable()
export class DeleteDriverProfileUseCase {
  constructor(
    @Inject(DRIVER_PROFILE_REPOSITORY)
    private readonly driverProfileRepository: DriverProfileRepositoryPort,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepositoryPort,
  ) {}

  async execute(currentUserId: string): Promise<void> {
    const userId = new UserId(currentUserId);

    const profile = await this.driverProfileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Driver profile does not exist');
    }

    await this.driverProfileRepository.deleteByUserId(userId);
    await this.roleRepository.removeRoleFromUser(userId, ROLE_DRIVER);
  }
}
