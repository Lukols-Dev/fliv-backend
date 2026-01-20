import { Injectable } from '@nestjs/common';
// import { Notification as PrismaNotification } from 'generated/prisma/client';
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

  // async listForUser(
  //   userId: UserId,
  //   params?: ListNotificationsParams,
  // ): Promise<Notification[]> {
  //   const { page, limit } = params ?? {};

  //   const take =
  //     Number.isFinite(limit) && (limit as number) > 0
  //       ? (limit as number)
  //       : undefined;
  //   const skip =
  //     Number.isFinite(page) && (page as number) > 0 && take
  //       ? ((page as number) - 1) * take
  //       : undefined;

  //   const rows: PrismaNotification[] = await this.prisma.notification.findMany({
  //     where: { userId: userId.value },
  //     orderBy: { createdAt: 'desc' },
  //     skip,
  //     take,
  //   });

  //   return rows.map((row) => NotificationMapper.toDomain(row));
  // }

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

    // Opcjonalnie (polecam): clamp page, żeby nie zwracać pustych stron po usunięciu danych
    // Jeśli chcesz clamp, to trzeba drugi query na findMany dla skorygowanej strony.
    // Wersja minimalna: bez clamp.

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
