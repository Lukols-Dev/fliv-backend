import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepositoryPort,
} from '../ports/user.repository.port';
import { RegisterDispatcherDto } from '../dto/register-user-profile.dto';

export interface RegisterDispatcherInput {
  currentUserId: string;
  payload: RegisterDispatcherDto;
}

@Injectable()
export class RegisterUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(input: RegisterDispatcherInput): Promise<void> {
    const user = await this.userRepository.findById(input.currentUserId);

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    await this.userRepository.update(input.currentUserId, {
      firstName: input.payload.firstName,
      lastName: input.payload.lastName,
      phone: input.payload.phone,
      isAgreedToTerms: input.payload.isAgreedToTerms,
      isAgreedToPrivacyPolicy: input.payload.isAgreedToPrivacyPolicy,
    });
  }
}
