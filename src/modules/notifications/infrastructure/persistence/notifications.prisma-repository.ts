import { Injectable } from '@nestjs/common';
import { Prisma, Notification as PrismaNotification } from 'generated/prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  type CreateNotificationInput,
  type NotificationRepositoryPort,
} from '../../application/ports/notification.repository.port';
import { NotificationMapper } from '../mappers/notification.mapper';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationId } from '../../domain/value-objects/notification-id.vo';
import { UserId } from 'src/modules/users/domain/value-objects/user-id.vo';

@Injectable()
export class NotificationsPrismaRepository
  implements NotificationRepositoryPort
{
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateNotificationInput): Promise<Notification> {
    const created = await this.prisma.notification.create({
      data: {
        userId: input.userId.value,
        type: input.type,
        message: input.message,
      },
    });

    return NotificationMapper.toDomain(created);
  }

  async markAsRead(id: NotificationId): Promise<void> {
    await this.prisma.notification.update({
      where: { id: id.value },
      data: { readAt: new Date() },
    });
  }

  async listForUser(userId: UserId): Promise<Notification[]> {
    const rows: PrismaNotification[] = await this.prisma.notification.findMany({
      where: { userId: userId.value },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => NotificationMapper.toDomain(row));
  }
}
