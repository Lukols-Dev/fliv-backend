import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepositoryPort,
} from '../ports/user.repository.port';
import { ActivateUserDto } from '../dto/activate-user.dto';
import { UserId } from '../../domain/value-objects/user-id.vo';

@Injectable()
export class ActivateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(dto: ActivateUserDto): Promise<void> {
    const userId = new UserId(dto.userId);

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    await this.userRepository.update(userId, {
      isActive: dto.isActive,
    });
  }
}
