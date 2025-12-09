import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import type { TransportOrderEventType as PrismaEventType } from 'generated/prisma/client';
import {
  type RecordTransportOrderEventInput,
  type TransportOrderEventRepositoryPort,
} from '../../application/ports/transport-order-event.repository.port';
import { TransportOrderEventMapper } from '../mappers/transport-order-event.mapper';
import { TransportOrderEvent } from '../../domain/entities/transport-order-event.entity';
import { TransportOrderId } from '../../domain/value-objects/transport-order-id.vo';

@Injectable()
export class TransportOrderEventPrismaRepository
  implements TransportOrderEventRepositoryPort
{
  constructor(private readonly prisma: PrismaService) {}

  async record(
    input: RecordTransportOrderEventInput,
  ): Promise<TransportOrderEvent> {
    const created = await this.prisma.transportOrderEvent.create({
      data: {
        transportOrderId: input.orderId.value,
        previousStatus: input.previousStatus,
        newStatus: input.newStatus,
        type: input.type as PrismaEventType,
        description: input.description ?? null,
        createdByUserId: input.userId.value,
      },
    });

    return TransportOrderEventMapper.toDomain(created);
  }

  async list(orderId: TransportOrderId): Promise<TransportOrderEvent[]> {
    const rows = await this.prisma.transportOrderEvent.findMany({
      where: { transportOrderId: orderId.value },
      orderBy: { createdAt: 'asc' },
    });

    return rows.map((row) => TransportOrderEventMapper.toDomain(row));
  }
}
