import { UserId } from 'src/modules/users/domain/value-objects/user-id.vo';
import { NotificationType } from '../../domain/value-objects/notification-type.vo';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationId } from '../../domain/value-objects/notification-id.vo';

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');

export interface CreateNotificationInput {
  userId: UserId;
  type: NotificationType;
  message: string;
}

export interface ListNotificationsParams {
  page?: number;
  limit?: number;
}

export interface NotificationRepositoryPort {
  create(input: CreateNotificationInput): Promise<Notification>;
  markAsRead(id: NotificationId): Promise<void>;
  listForUser(
    userId: UserId,
    params?: ListNotificationsParams,
  ): Promise<Notification[]>;
  findById(id: NotificationId): Promise<Notification | null>;
  delete(id: NotificationId): Promise<void>;
  deleteAllForUser(userId: UserId): Promise<void>;
}
