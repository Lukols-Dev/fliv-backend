import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { NOTIFICATION_REPOSITORY } from './application/ports/notification.repository.port';
import { NotificationsPrismaRepository } from './infrastructure/persistence/notifications.prisma-repository';
import { CreateNotificationUseCase } from './application/use-cases/create-notification.usecase';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: NotificationsPrismaRepository,
    },
    CreateNotificationUseCase,
  ],
  exports: [NOTIFICATION_REPOSITORY, CreateNotificationUseCase],
})
export class NotificationsModule {}
