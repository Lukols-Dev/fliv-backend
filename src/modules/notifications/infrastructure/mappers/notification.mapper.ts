import { Prisma } from 'generated/prisma/client';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationId } from '../../domain/value-objects/notification-id.vo';
import { NotificationType } from '../../domain/value-objects/notification-type.vo';

type NotificationRecord = {
  id: string;
  userId: string;
  type: string;
  data: Prisma.JsonValue;
  createdAt: Date;
  readAt: Date | null;
};

export class NotificationMapper {
  static toDomain(record: NotificationRecord): Notification {
    return new Notification(
      new NotificationId(record.id),
      record.userId,
      record.type as NotificationType,
      record.data as Record<string, unknown>,
      record.createdAt,
      record.readAt ?? null,
    );
  }
}
