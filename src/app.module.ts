import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { ConfigModule } from './config/config.module';
import { LoggingModule } from './infrastructure/logging/logging.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';

import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

@Module({
  imports: [
    //global config module
    ConfigModule,

    //insfrastructure modules
    LoggingModule,
    PrismaModule,

    //domeain / features modules
    //TODO: AuthModule, UsersModule, RolesModule, TransportOrdersModule, NotificationsModule, DriverModule, DispatcherModule
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
