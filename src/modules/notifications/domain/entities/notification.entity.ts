import { NotificationId } from '../value-objects/notification-id.vo';
import { NotificationType } from '../value-objects/notification-type.vo';

export class Notification {
  constructor(
    public readonly id: NotificationId,
    public readonly userId: string,
    public readonly type: NotificationType,
    public readonly message: string,
    public readonly createdAt: Date,
    public readonly readAt: Date | null,
  ) {}
}
