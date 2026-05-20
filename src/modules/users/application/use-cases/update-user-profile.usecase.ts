import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  USER_REPOSITORY,
  type UserRepositoryPort,
} from '../ports/user.repository.port';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { UserId } from '../../domain/value-objects/user-id.vo';

export interface UpdateUserProfileInput {
  currentUserId: string;
  payload: UpdateUserProfileDto;
}

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(input: UpdateUserProfileInput): Promise<void> {
    const userId = new UserId(input.currentUserId);

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    if (!user.isActive) {
      throw new BadRequestException('Account is not active');
    }

    await this.userRepository.update(userId, {
      firstName: input.payload.firstName ?? user.firstName,
      lastName: input.payload.lastName ?? user.lastName,
      phone: input.payload.phone ?? user.phone,
      isAgreedToTerms: input.payload.isAgreedToTerms ?? user.isAgreedToTerms,
      isAgreedToPrivacyPolicy:
        input.payload.isAgreedToPrivacyPolicy ?? user.isAgreedToPrivacyPolicy,
    });
  }
}
