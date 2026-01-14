import { Injectable } from '@nestjs/common';
import { Notification as PrismaNotification } from 'generated/prisma/client';
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

  async findById(id: NotificationId): Promise<Notification | null> {
    const row = await this.prisma.notification.findUnique({
      where: { id: id.value },
    });

    return row ? NotificationMapper.toDomain(row) : null;
  }

  async delete(id: NotificationId): Promise<void> {
    await this.prisma.notification.delete({
      where: { id: id.value },
    });
  }

  async deleteAllForUser(userId: UserId): Promise<void> {
    await this.prisma.notification.deleteMany({
      where: { userId: userId.value },
    });
  }
}
