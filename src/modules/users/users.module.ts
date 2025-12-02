import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

import { USER_REPOSITORY } from './application/ports/user.repository.port';
import { ROLE_REPOSITORY } from './application/ports/role.repository.port';
import { DRIVER_PROFILE_REPOSITORY } from './application/ports/driver-profile.repository.port';

import { UsersPrismaRepository } from './infrastructure/presistence/users.prisma-repository';
import { RolesPrismaRepository } from './infrastructure/presistence/roles.prisma-repository';
import { DriverProfilePrismaRepository } from './infrastructure/presistence/driver-profile.prisma-repository';

import { RegisterDriverUseCase } from './application/use-cases/register-driver.usecase';
import { RegisterDispatcherUseCase } from './application/use-cases/register-dispatcher.usecase';
import { ActivateUserUseCase } from './application/use-cases/activate-user.usecase';
import { UpdateDriverUseCase } from './application/use-cases/update-driver-documents.usecase';

import { DriverRegistrationController } from './interface/rest/driver-registration.controller';
import { UsersController } from './interface/rest/users.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UsersPrismaRepository,
    },
    {
      provide: ROLE_REPOSITORY,
      useClass: RolesPrismaRepository,
    },
    {
      provide: DRIVER_PROFILE_REPOSITORY,
      useClass: DriverProfilePrismaRepository,
    },
    RegisterDriverUseCase,
    RegisterDispatcherUseCase,
    ActivateUserUseCase,
    UpdateDriverUseCase,
  ],
  controllers: [DriverRegistrationController, UsersController],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
