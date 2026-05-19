import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { DocumentsModule } from 'src/modules/documents/documents.module';

import { USER_REPOSITORY } from './application/ports/user.repository.port';
import { ROLE_REPOSITORY } from './application/ports/role.repository.port';
import { DRIVER_PROFILE_REPOSITORY } from './application/ports/driver-profile.repository.port';

import { UsersPrismaRepository } from './infrastructure/presistence/users.prisma-repository';
import { RolesPrismaRepository } from './infrastructure/presistence/roles.prisma-repository';
import { DriverProfilePrismaRepository } from './infrastructure/presistence/driver-profile.prisma-repository';

import { RegisterDriverUseCase } from './application/use-cases/register-driver.usecase';
import { RegisterDriverAccountUseCase } from './application/use-cases/register-driver-account.usecase';
import { ActivateUserUseCase } from './application/use-cases/activate-user.usecase';
import { UpdateDriverUseCase } from './application/use-cases/update-driver-documents.usecase';
import { AssignRoleToUserUseCase } from './application/use-cases/assign-role-to-user.usecase';
import { RegisterUserProfileUseCase } from './application/use-cases/register-user-profile.usecase';

import { DriverRegistrationController } from './interface/rest/driver-registration.controller';
import { UsersController } from './interface/rest/users.controller';
import { UpdateUserProfileUseCase } from './application/use-cases/update-user-profile.usecase';
import { DeleteUserUseCase } from './application/use-cases/delete-user.usecase';
import { DeleteDriverProfileUseCase } from './application/use-cases/delete-driver-profile.usecase';
import { GetDriverProfileUseCase } from './application/use-cases/get-driver-profile.usecase';
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user.usecase';
import { UploadUserAvatarUseCase } from './application/use-cases/upload-user-avatar.usecase';

@Module({
  imports: [PrismaModule, DocumentsModule],
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
    ActivateUserUseCase,
    AssignRoleToUserUseCase,
    DeleteUserUseCase,
    DeleteDriverProfileUseCase,
    GetDriverProfileUseCase,
    GetCurrentUserUseCase,
    RegisterDriverUseCase,
    RegisterDriverAccountUseCase,
    RegisterUserProfileUseCase,
    UpdateUserProfileUseCase,
    UpdateDriverUseCase,
    UploadUserAvatarUseCase,
  ],
  controllers: [DriverRegistrationController, UsersController],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
