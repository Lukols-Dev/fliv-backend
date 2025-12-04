import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';

import { ConfigModule } from './config/config.module';
import { LoggingModule } from './infrastructure/logging/logging.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';

import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

import { UsersModule } from './modules/users/users.module';
import { betterAuthClient } from './infrastructure/auth/better-auth.client';

@Module({
  imports: [
    //global config module
    ConfigModule,

    //insfrastructure modules
    LoggingModule,
    PrismaModule,

    BetterAuthModule.forRoot({ auth: betterAuthClient }),

    //domeain / features modules
    //TODO: AuthModule, UsersModule, RolesModule, TransportOrdersModule, NotificationsModule, DriverModule, DispatcherModule
    UsersModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
