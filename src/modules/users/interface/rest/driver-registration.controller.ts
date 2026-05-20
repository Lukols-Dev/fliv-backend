import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AllowAnonymous, Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

import { RegisterDriverAccountDto } from '../../application/dto/register-driver-account.dto';
import { RegisterDriverAccountUseCase } from '../../application/use-cases/register-driver-account.usecase';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateUserProfileDto } from '../../application/dto/update-user-profile.dto';
import { UpdateUserProfileUseCase } from '../../application/use-cases/update-user-profile.usecase';
import { UpdateDriverDto } from '../../application/dto/update-driver-documents.dto';
import { UpdateDriverUseCase } from '../../application/use-cases/update-driver-documents.usecase';
import { DeleteDriverProfileUseCase } from '../../application/use-cases/delete-driver-profile.usecase';
import { GetDriverProfileUseCase } from '../../application/use-cases/get-driver-profile.usecase';
import { Roles } from 'src/modules/auth/interface/http/roles.decorator';
import { ROLE_ADMIN, ROLE_DRIVER } from 'src/shared/constants/roles.constants';
@ApiTags('Driver')
@ApiBearerAuth()
@Controller('driver')
export class DriverRegistrationController {
  constructor(
    private readonly registerDriverAccountUseCase: RegisterDriverAccountUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly updateDriverUseCase: UpdateDriverUseCase,
    private readonly deleteDriverProfileUseCase: DeleteDriverProfileUseCase,
    private readonly getDriverProfileUseCase: GetDriverProfileUseCase,
  ) {}

  @Post('register-account')
  @AllowAnonymous()
  @ApiOperation({
    summary: 'Self-register a driver account (account + driver profile)',
    description:
      'Creates the auth account and the driver profile atomically. ' +
      'No session is established — the account requires manual activation ' +
      'before the driver can sign in.',
  })
  async registerAccount(
    @Body() dto: RegisterDriverAccountDto,
  ): Promise<{ success: boolean }> {
    await this.registerDriverAccountUseCase.execute(dto);

    return { success: true };
  }

  @Patch('profile')
  @Roles(ROLE_DRIVER)
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

  @Patch('documents')
  @Roles(ROLE_DRIVER)
  async updateDocuments(
    @Session() session: UserSession,
    @Body() dto: UpdateDriverDto,
  ): Promise<{ success: boolean }> {
    await this.updateDriverUseCase.execute({
      currentUserId: session.user.id,
      payload: dto,
    });

    return { success: true };
  }

  @Get('profile')
  @Roles(ROLE_DRIVER)
  @ApiOperation({
    summary: 'Get current driver full profile',
    description:
      'Returns user basic data and driver profile (documents, internal ids).',
  })
  async getProfile(@Session() session: UserSession) {
    const profile = await this.getDriverProfileUseCase.execute(session.user.id);
    return profile;
  }

  @Delete()
  @Roles(ROLE_DRIVER)
  @ApiOperation({
    summary: 'Delete current driver profile (self)',
    description: 'Removes driver profile and DRIVER role for current user.',
  })
  async deleteDriverSelf(
    @Session() session: UserSession,
  ): Promise<{ success: boolean }> {
    await this.deleteDriverProfileUseCase.execute(session.user.id);
    return { success: true };
  }

  @Delete(':userId')
  @Roles(ROLE_ADMIN)
  @ApiOperation({
    summary: 'Delete driver profile by userId (admin)',
    description:
      'Removes driver profile and DRIVER role for given user. Should be admin-only.',
  })
  async deleteDriverByAdmin(
    @Param('userId') userId: string,
  ): Promise<{ success: boolean }> {
    await this.deleteDriverProfileUseCase.execute(userId);
    return { success: true };
  }
}
