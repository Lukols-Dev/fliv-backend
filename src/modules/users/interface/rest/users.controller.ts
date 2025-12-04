import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

import { ActivateUserDto } from '../../application/dto/activate-user.dto';
import { ActivateUserUseCase } from '../../application/use-cases/activate-user.usecase';
import {
  USER_REPOSITORY,
  type UserRepositoryPort,
} from '../../application/ports/user.repository.port';
import { Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RegisterUserProfileDto } from '../../application/dto/register-user-profile.dto';
import { RegisterUserProfileUseCase } from '../../application/use-cases/register-user-profile.usecase';
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(
    private readonly registerUserProfileUseCase: RegisterUserProfileUseCase,
    private readonly activateUserUseCase: ActivateUserUseCase,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  @Post('profile')
  async completeProfile(
    @Session() session: UserSession,
    @Body() dto: RegisterUserProfileDto,
  ): Promise<{ success: boolean }> {
    await this.registerUserProfileUseCase.execute({
      currentUserId: session.user.id,
      payload: dto,
    });

    return { success: true };
  }

  // TODO: only ADMIN – for now, no roles guard
  @Post('activate')
  async activateUser(
    @Body() dto: ActivateUserDto,
  ): Promise<{ success: boolean }> {
    await this.activateUserUseCase.execute(dto);
    return { success: true };
  }

  @Get('me')
  async me(@Session() session: UserSession) {
    const user = await this.userRepository.findWithRolesById(session.user.id);
    return {
      id: user?.id,
      email: user?.email,
      roles: user?.roles,
      isActive: user?.isActive,
    };
  }
}
