import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepositoryPort,
} from '../ports/user.repository.port';
import { UserId } from '../../domain/value-objects/user-id.vo';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(rawUserId: string): Promise<void> {
    const userId = new UserId(rawUserId);

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    await this.userRepository.delete(userId);
  }
}
