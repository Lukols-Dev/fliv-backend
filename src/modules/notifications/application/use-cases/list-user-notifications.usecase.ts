import { Inject, Injectable } from '@nestjs/common';
import { UserId } from 'src/modules/users/domain/value-objects/user-id.vo';
import {
  NOTIFICATION_REPOSITORY,
  type NotificationRepositoryPort,
} from '../ports/notification.repository.port';
import { Notification } from '../../domain/entities/notification.entity';

export interface ListUserNotificationsInput {
  currentUserId: string;
}

@Injectable()
export class ListUserNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepositoryPort,
  ) {}

  async execute(input: ListUserNotificationsInput): Promise<Notification[]> {
    const userId = new UserId(input.currentUserId);
    return this.notificationRepository.listForUser(userId);
  }
}
