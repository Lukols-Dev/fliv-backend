import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepositoryPort,
} from '../ports/user.repository.port';
import { RegisterUserProfileDto } from '../dto/register-user-profile.dto';
import { UserId } from '../../domain/value-objects/user-id.vo';

export interface RegisterDispatcherInput {
  currentUserId: string;
  payload: RegisterUserProfileDto;
}

@Injectable()
export class RegisterUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(input: RegisterDispatcherInput): Promise<void> {
    const userId = new UserId(input.currentUserId);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    await this.userRepository.update(userId, {
      firstName: input.payload.firstName,
      lastName: input.payload.lastName,
      phone: input.payload.phone,
      isAgreedToTerms: input.payload.isAgreedToTerms,
      isAgreedToPrivacyPolicy: input.payload.isAgreedToPrivacyPolicy,
    });
  }
}
