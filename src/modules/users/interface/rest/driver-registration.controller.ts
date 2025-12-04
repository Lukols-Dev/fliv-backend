import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

import { RegisterDriverDto } from '../../application/dto/register-driver.dto';
import { RegisterDriverUseCase } from '../../application/use-cases/register-driver.usecase';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiTags('Driver')
@ApiBearerAuth()
@Controller('driver')
@UseGuards(AuthGuard)
export class DriverRegistrationController {
  constructor(private readonly registerDriverUseCase: RegisterDriverUseCase) {}

  @Post('register')
  async register(
    @Session() session: UserSession,
    @Body() dto: RegisterDriverDto,
  ): Promise<{ success: boolean }> {
    await this.registerDriverUseCase.execute({
      currentUserId: session.user.id,
      payload: dto,
    });

    return { success: true };
  }
}
