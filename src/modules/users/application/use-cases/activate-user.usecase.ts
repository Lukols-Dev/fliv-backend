import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepositoryPort,
} from '../ports/user.repository.port';
import { ActivateUserDto } from '../dto/activate-user.dto';

@Injectable()
export class ActivateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(dto: ActivateUserDto): Promise<void> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    await this.userRepository.update(dto.userId, {
      isActive: dto.isActive,
    });
  }
}
