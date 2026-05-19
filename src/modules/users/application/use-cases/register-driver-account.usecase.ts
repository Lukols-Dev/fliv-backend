import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { APIError } from 'better-auth/api';

import { betterAuthClient } from 'src/infrastructure/auth/better-auth.client';
import {
  USER_REPOSITORY,
  type UserRepositoryPort,
} from '../ports/user.repository.port';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { RegisterDriverUseCase } from './register-driver.usecase';
import { RegisterDriverAccountDto } from '../dto/register-driver-account.dto';

@Injectable()
export class RegisterDriverAccountUseCase {
  private readonly logger = new Logger(RegisterDriverAccountUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    private readonly registerDriverUseCase: RegisterDriverUseCase,
  ) {}

  /**
   * Atomic driver self-registration: creates the auth account and the driver
   * profile in a single server-side operation. No session is established
   * (`autoSignIn` is disabled) — the account still requires manual activation
   * before the driver can sign in.
   */
  async execute(dto: RegisterDriverAccountDto): Promise<void> {
    const firstName = dto.firstName.trim();
    const lastName = dto.lastName.trim();

    const userId = await this.createAuthAccount({
      email: dto.email.trim().toLowerCase(),
      password: dto.password,
      firstName,
      lastName,
      isAgreedToTerms: dto.isAgreedToTerms,
      isAgreedToPrivacyPolicy: dto.isAgreedToPrivacyPolicy,
    });

    try {
      await this.registerDriverUseCase.execute({
        currentUserId: userId,
        payload: {
          companyInternalId: dto.companyInternalId.trim(),
          phone: dto.phone?.trim(),
        },
      });
    } catch (error) {
      // Compensating action: the auth account exists but the driver profile
      // failed — remove the orphan user so registration can be retried.
      await this.deleteOrphanUser(userId);
      throw error;
    }
  }

  private async createAuthAccount(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    isAgreedToTerms: boolean;
    isAgreedToPrivacyPolicy: boolean;
  }): Promise<string> {
    try {
      const result = await betterAuthClient.api.signUpEmail({
        body: {
          email: input.email,
          password: input.password,
          name: `${input.firstName} ${input.lastName}`.trim(),
          firstName: input.firstName,
          lastName: input.lastName,
          isAgreedToTerms: input.isAgreedToTerms,
          isAgreedToPrivacyPolicy: input.isAgreedToPrivacyPolicy,
        },
      });

      const userId = result?.user?.id;
      if (!userId) {
        throw new BadRequestException('Account creation failed');
      }

      return userId;
    } catch (error) {
      if (error instanceof APIError) {
        const message =
          typeof error.body?.message === 'string'
            ? error.body.message
            : 'Account creation failed';

        if (/exist/i.test(message)) {
          throw new ConflictException(message);
        }
        throw new BadRequestException(message);
      }
      throw error;
    }
  }

  private async deleteOrphanUser(userId: string): Promise<void> {
    try {
      await this.userRepository.delete(new UserId(userId));
    } catch (cleanupError) {
      this.logger.error(
        `Failed to clean up orphan user ${userId} after registration error`,
        cleanupError instanceof Error ? cleanupError.stack : undefined,
      );
    }
  }
}
