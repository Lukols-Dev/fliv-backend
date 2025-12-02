import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepositoryPort,
} from '../ports/user.repository.port';
import {
  ROLE_REPOSITORY,
  type RoleRepositoryPort,
} from '../ports/role.repository.port';
import { RegisterDispatcherDto } from '../dto/register-dispatcher.dto';
import { ROLE_DISPATCHER } from 'src/shared/constants/roles.constants';

export interface RegisterDispatcherInput {
  currentUserId: string;
  payload: RegisterDispatcherDto;
}

@Injectable()
export class RegisterDispatcherUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepositoryPort,
  ) {}

  async execute(input: RegisterDispatcherInput): Promise<void> {
    const user = await this.userRepository.findById(input.currentUserId);
    if (!user) {
      throw new Error('User does not exist');
    }

    await this.roleRepository.ensureRoleExists(ROLE_DISPATCHER);
    await this.roleRepository.assignRoleToUser(
      input.currentUserId,
      ROLE_DISPATCHER,
    );

    if (input.payload.phone) {
      await this.userRepository.update(input.currentUserId, {
        phone: input.payload.phone,
      });
    }
  }
}
