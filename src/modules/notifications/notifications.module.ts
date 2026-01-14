import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { NOTIFICATION_REPOSITORY } from './application/ports/notification.repository.port';
import { NotificationsPrismaRepository } from './infrastructure/persistence/notifications.prisma-repository';
import { CreateNotificationUseCase } from './application/use-cases/create-notification.usecase';
import { ListUserNotificationsUseCase } from './application/use-cases/list-user-notifications.usecase';
import { MarkNotificationReadUseCase } from './application/use-cases/mark-notification-read.usecase';
import { DeleteNotificationUseCase } from './application/use-cases/delete-notification.usecase';
import { ClearAllNotificationsUseCase } from './application/use-cases/clear-all-notifications.usecase';
import { NotificationsController } from './interface/rest/notifications.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: NotificationsPrismaRepository,
    },
    CreateNotificationUseCase,
    ListUserNotificationsUseCase,
    MarkNotificationReadUseCase,
    DeleteNotificationUseCase,
    ClearAllNotificationsUseCase,
  ],
  exports: [
    NOTIFICATION_REPOSITORY,
    CreateNotificationUseCase,
    ListUserNotificationsUseCase,
    MarkNotificationReadUseCase,
    DeleteNotificationUseCase,
    ClearAllNotificationsUseCase,
  ],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
