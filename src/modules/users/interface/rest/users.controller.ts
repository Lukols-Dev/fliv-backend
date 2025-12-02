import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

import { RegisterDispatcherDto } from '../../application/dto/register-dispatcher.dto';
import { ActivateUserDto } from '../../application/dto/activate-user.dto';
import { RegisterDispatcherUseCase } from '../../application/use-cases/register-dispatcher.usecase';
import { ActivateUserUseCase } from '../../application/use-cases/activate-user.usecase';
import {
  USER_REPOSITORY,
  type UserRepositoryPort,
} from '../../application/ports/user.repository.port';
import { Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(
    private readonly registerDispatcherUseCase: RegisterDispatcherUseCase,
    private readonly activateUserUseCase: ActivateUserUseCase,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  @Post('register-dispatcher')
  async registerDispatcher(
    @Session() session: UserSession,
    @Body() dto: RegisterDispatcherDto,
  ): Promise<{ success: boolean }> {
    await this.registerDispatcherUseCase.execute({
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
