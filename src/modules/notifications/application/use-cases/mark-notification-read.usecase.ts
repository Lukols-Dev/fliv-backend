import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserId } from 'src/modules/users/domain/value-objects/user-id.vo';
import {
  NOTIFICATION_REPOSITORY,
  type NotificationRepositoryPort,
} from '../ports/notification.repository.port';
import { NotificationId } from '../../domain/value-objects/notification-id.vo';
import { Notification } from '../../domain/entities/notification.entity';

export interface MarkNotificationReadInput {
  currentUserId: string;
  notificationId: string;
}

@Injectable()
export class MarkNotificationReadUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepositoryPort,
  ) {}

  async execute(input: MarkNotificationReadInput): Promise<Notification> {
    const notifId = new NotificationId(input.notificationId);
    const userId = new UserId(input.currentUserId);

    const existing = await this.notificationRepository.findById(notifId);
    if (!existing) {
      throw new NotFoundException('Notification not found');
    }
    if (existing.userId !== userId.value) {
      throw new ForbiddenException('Not allowed');
    }

    await this.notificationRepository.markAsRead(notifId);

    const updated = await this.notificationRepository.findById(notifId);
    return updated ?? existing;
  }
}
