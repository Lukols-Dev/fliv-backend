import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

import { ActivateUserDto } from '../../application/dto/activate-user.dto';
import { ActivateUserUseCase } from '../../application/use-cases/activate-user.usecase';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterUserProfileDto } from '../../application/dto/register-user-profile.dto';
import { RegisterUserProfileUseCase } from '../../application/use-cases/register-user-profile.usecase';
import { UpdateUserProfileDto } from '../../application/dto/update-user-profile.dto';
import { UpdateUserProfileUseCase } from '../../application/use-cases/update-user-profile.usecase';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.usecase';
import { GetCurrentUserUseCase } from '../../application/use-cases/get-current-user.usecase';
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(
    private readonly registerUserProfileUseCase: RegisterUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly activateUserUseCase: ActivateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
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

  @Patch('profile')
  @ApiOperation({
    summary: 'Update current user profile',
    description:
      'Partial update of user profile (firstName, lastName, phone, consents).',
  })
  async updateProfile(
    @Session() session: UserSession,
    @Body() dto: UpdateUserProfileDto,
  ): Promise<{ success: boolean }> {
    await this.updateUserProfileUseCase.execute({
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
    const user = await this.getCurrentUserUseCase.execute(session.user.id);
    return user;
  }

  @Delete('me')
  @ApiOperation({
    summary: 'Delete current user account (self)',
    description: 'Deletes the authenticated user account.',
  })
  async deleteMe(
    @Session() session: UserSession,
  ): Promise<{ success: boolean }> {
    await this.deleteUserUseCase.execute(session.user.id);
    return { success: true };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user by id (admin)',
    description:
      'Deletes user by id. Should be protected by admin roles guard.',
  })
  async deleteUser(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.deleteUserUseCase.execute(id);

    return { success: true };
  }
}
