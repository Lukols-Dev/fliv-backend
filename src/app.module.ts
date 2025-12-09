import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';

import { ConfigModule } from './config/config.module';
import { LoggingModule } from './infrastructure/logging/logging.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';

import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

import { UsersModule } from './modules/users/users.module';
import { betterAuthClient } from './infrastructure/auth/better-auth.client';
import { TransportOrdersModule } from './modules/transport-orders/transport-orders.module';
import { DocumentsModule } from './modules/documents/documents.module';

@Module({
  imports: [
    //global config module
    ConfigModule,

    //insfrastructure modules
    LoggingModule,
    PrismaModule,

    //domeain / features modules
    //TODO: RolesModule, NotificationsModule, DriverModule, DispatcherModule
    BetterAuthModule.forRoot({ auth: betterAuthClient }),
    UsersModule,
    TransportOrdersModule,
    DocumentsModule,
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
