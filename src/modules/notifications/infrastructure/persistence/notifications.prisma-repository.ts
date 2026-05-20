import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  type CreateNotificationInput,
  type NotificationRepositoryPort,
  type ListNotificationsParams,
  ListNotificationsResult,
} from '../../application/ports/notification.repository.port';
import { NotificationMapper } from '../mappers/notification.mapper';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationId } from '../../domain/value-objects/notification-id.vo';
import { UserId } from 'src/modules/users/domain/value-objects/user-id.vo';
import { Prisma } from 'generated/prisma/client';

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
        data: input.data as Prisma.InputJsonValue,
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

  async listForUser(
    userId: UserId,
    params?: ListNotificationsParams,
  ): Promise<ListNotificationsResult> {
    const page =
      params?.page && Number.isFinite(params.page) && params.page > 0
        ? params.page
        : 1;
    const limit =
      params?.limit && Number.isFinite(params.limit) && params.limit > 0
        ? params.limit
        : 10;

    const skip = (page - 1) * limit;
    const where = { userId: userId.value } as const;

    const [totalItems, rows] = await this.prisma.$transaction([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    return {
      items: rows.map((row) => NotificationMapper.toDomain(row)),
      page,
      limit,
      totalItems,
      totalPages,
    };
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
