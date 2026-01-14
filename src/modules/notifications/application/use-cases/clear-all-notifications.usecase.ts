import { Inject, Injectable } from '@nestjs/common';
import {
  NOTIFICATION_REPOSITORY,
  type NotificationRepositoryPort,
} from '../ports/notification.repository.port';
import { UserId } from 'src/modules/users/domain/value-objects/user-id.vo';

export interface ClearAllNotificationsInput {
  currentUserId: string;
}

@Injectable()
export class ClearAllNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepositoryPort,
  ) {}

  async execute(input: ClearAllNotificationsInput): Promise<void> {
    const userId = new UserId(input.currentUserId);
    await this.notificationRepository.deleteAllForUser(userId);
  }
}
