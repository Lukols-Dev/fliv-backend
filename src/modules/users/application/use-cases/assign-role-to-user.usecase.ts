import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepositoryPort,
} from '../ports/user.repository.port';
import {
  ROLE_REPOSITORY,
  type RoleRepositoryPort,
} from '../ports/role.repository.port';
import type { RoleKey } from 'src/shared/constants/roles.constants';

export interface AssignRoleToUserInput {
  targetUserId: string;
  roleKey: RoleKey;
}

@Injectable()
export class AssignRoleToUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepositoryPort,
  ) {}

  async execute(input: AssignRoleToUserInput): Promise<void> {
    const user = await this.userRepository.findById(input.targetUserId);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    await this.roleRepository.ensureRoleExists(input.roleKey);
    await this.roleRepository.assignRoleToUser(
      input.targetUserId,
      input.roleKey,
    );
  }
}
