import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepositoryPort,
} from '../ports/user.repository.port';
import { UserId } from '../../domain/value-objects/user-id.vo';

export interface CurrentUserResult {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  roles: string[];
  isActive: boolean;
}

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(currentUserId: string): Promise<CurrentUserResult> {
    const userId = new UserId(currentUserId);

    const user = await this.userRepository.findWithRolesById(userId);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      roles: user.roles,
      isActive: user.isActive,
    };
  }
}
