import { Inject, Injectable } from '@nestjs/common';
import { UserId } from 'src/modules/users/domain/value-objects/user-id.vo';
import {
  NOTIFICATION_REPOSITORY,
  type NotificationRepositoryPort,
} from '../ports/notification.repository.port';
import { NotificationType } from '../../domain/value-objects/notification-type.vo';
import { Notification } from '../../domain/entities/notification.entity';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  message: string;
}

@Injectable()
export class CreateNotificationUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepositoryPort,
  ) {}

  async execute(input: CreateNotificationInput): Promise<Notification> {
    return this.notificationRepository.create({
      userId: new UserId(input.userId),
      type: input.type,
      message: input.message,
    });
  }
}
