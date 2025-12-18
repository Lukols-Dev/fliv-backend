// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';

import { ACCESS_CONTROL_PORT } from './application/ports/access-control.port';
import { AccessControlPrismaAdapter } from './infrastructure/access-control-prisma.adapter';
import { RolesGuard } from './interface/http/roles.guard';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: ACCESS_CONTROL_PORT,
      useClass: AccessControlPrismaAdapter,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [ACCESS_CONTROL_PORT],
})
export class AuthModule {}
