import { NotificationId } from '../value-objects/notification-id.vo';
import { NotificationType } from '../value-objects/notification-type.vo';

export class Notification {
  constructor(
    public readonly id: NotificationId,
    public readonly userId: string,
    public readonly type: NotificationType,
    public readonly data: Record<string, unknown>,
    public readonly createdAt: Date,
    public readonly readAt: Date | null,
  ) {}
}
