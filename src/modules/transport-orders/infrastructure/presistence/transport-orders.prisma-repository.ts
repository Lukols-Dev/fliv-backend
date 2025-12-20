import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  Prisma,
  TransportOrderStatus as PrismaTransportOrderStatus,
} from 'generated/prisma/client';
import {
  type CreateTransportOrderInput,
  type TransportOrderRepositoryPort,
  type UpdateTransportOrderInput,
  type ListTransportOrdersParams,
  type AssignDriverParams,
} from '../../application/ports/transport-order.repository.port';
import { TransportOrder } from '../../domain/entities/transport-order.entity';
import { TransportOrderId } from '../../domain/value-objects/transport-order-id.vo';
import { TransportOrderMapper } from '../mappers/transport-order.mapper';
import { UserId } from 'src/modules/users/domain/value-objects/user-id.vo';

type TransportOrderWithDocuments = Prisma.TransportOrderGetPayload<{
  include: {
    orderDocuments: true;
    events: { orderBy: { createdAt: 'asc' } };
  };
}>;

@Injectable()
export class TransportOrdersPrismaRepository
  implements TransportOrderRepositoryPort
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: TransportOrderId): Promise<TransportOrder | null> {
    const record = await this.prisma.transportOrder.findUnique({
      where: { id: id.value },
      include: {
        orderDocuments: true,
        events: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!record) {
      return null;
    }

    return TransportOrderMapper.toDomain(record);
  }

  async findByZtNumber(ztNumber: string): Promise<TransportOrder | null> {
    const record = await this.prisma.transportOrder.findUnique({
      where: { ztNumber },
      include: {
        orderDocuments: true,
        events: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!record) {
      return null;
    }

    return TransportOrderMapper.toDomain(record);
  }

  async create(input: CreateTransportOrderInput): Promise<TransportOrder> {
    const created = await this.prisma.transportOrder.create({
      data: {
        ztNumber: input.ztNumber,
        pwNumber: input.pwNumber ?? null,
        vehiclePlate: input.vehiclePlate,
        trailerPlate: input.trailerPlate ?? null,
        driverFirstName: input.driverFirstName,
        driverLastName: input.driverLastName,
        driverPhone: input.driverPhone,
        clientName: input.clientName,
        contractNumber: input.contractNumber ?? null,
        payerName: input.payerName ?? null,
        payerVatId: input.payerVatId ?? null,
        payerEmail: input.payerEmail ?? null,
        fromCountry: input.fromCountry,
        toCountry: input.toCountry,
        cargoWeightKg: input.cargoWeightKg ?? null,
        loadingDate: input.loadingDate ?? null,
        cargoDescription: input.cargoDescription ?? null,
        temperatureSensitive: input.temperatureSensitive,
        notes: input.notes ?? null,
        createdByUserId: input.createdByUserId,
      },
      include: {
        orderDocuments: true,
        events: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return TransportOrderMapper.toDomain(created);
  }

  async update(
    id: TransportOrderId,
    input: UpdateTransportOrderInput,
  ): Promise<TransportOrder> {
    const updated = await this.prisma.transportOrder.update({
      where: { id: id.value },
      data: {
        ztNumber: input.ztNumber,
        pwNumber: input.pwNumber,
        vehiclePlate: input.vehiclePlate,
        trailerPlate: input.trailerPlate,
        driverFirstName: input.driverFirstName,
        driverLastName: input.driverLastName,
        driverPhone: input.driverPhone,
        clientName: input.clientName,
        contractNumber: input.contractNumber,
        payerName: input.payerName,
        payerVatId: input.payerVatId,
        payerEmail: input.payerEmail,
        fromCountry: input.fromCountry,
        toCountry: input.toCountry,
        cargoWeightKg: input.cargoWeightKg,
        loadingDate: input.loadingDate,
        cargoDescription: input.cargoDescription,
        temperatureSensitive: input.temperatureSensitive,
        notes: input.notes,
        status: input.status,
      },
      include: {
        orderDocuments: true,
        events: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return TransportOrderMapper.toDomain(updated);
  }

  async delete(id: TransportOrderId): Promise<void> {
    await this.prisma.transportOrder.delete({
      where: { id: id.value },
    });
  }

  async listForDispatcher(
    dispatcherId: UserId,
    params?: ListTransportOrdersParams,
  ): Promise<TransportOrder[]> {
    const { status, page, limit } = params ?? {};

    const parsedStatus =
      status &&
      Object.values(PrismaTransportOrderStatus).includes(
        status as PrismaTransportOrderStatus,
      )
        ? (status as PrismaTransportOrderStatus)
        : undefined;

    const take =
      Number.isFinite(limit) && (limit as number) > 0
        ? (limit as number)
        : undefined;
    const skip =
      Number.isFinite(page) && (page as number) > 0 && take
        ? ((page as number) - 1) * take
        : undefined;

    const where: Prisma.TransportOrderWhereInput = {
      createdByUserId: dispatcherId.value,
      ...(parsedStatus ? { status: parsedStatus } : {}),
    };

    const records: TransportOrderWithDocuments[] =
      await this.prisma.transportOrder.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
        include: {
          orderDocuments: true,
          events: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

    return records.map((record) => TransportOrderMapper.toDomain(record));
  }

  async listForDriver(
    userId: UserId,
    params?: ListTransportOrdersParams,
  ): Promise<TransportOrder[]> {
    const { status, page, limit } = params ?? {};

    const parsedStatus =
      status &&
      Object.values(PrismaTransportOrderStatus).includes(
        status as PrismaTransportOrderStatus,
      )
        ? (status as PrismaTransportOrderStatus)
        : undefined;

    const take =
      Number.isFinite(limit) && (limit as number) > 0
        ? (limit as number)
        : undefined;
    const skip =
      Number.isFinite(page) && (page as number) > 0 && take
        ? ((page as number) - 1) * take
        : undefined;

    const where: Prisma.TransportOrderWhereInput = {
      assignedDriverUserId: userId.value,
      ...(parsedStatus ? { status: parsedStatus } : {}),
    };

    const records: TransportOrderWithDocuments[] =
      await this.prisma.transportOrder.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
        include: {
          orderDocuments: true,
          events: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

    return records.map((record) => TransportOrderMapper.toDomain(record));
  }

  async assignToDriver(params: AssignDriverParams): Promise<TransportOrder> {
    const { orderId, driverUserId } = params;

    const record = await this.prisma.transportOrder.update({
      where: { id: orderId.value },
      data: { assignedDriverUserId: driverUserId.value },
      include: {
        orderDocuments: true,
        events: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return TransportOrderMapper.toDomain(record);
  }
}
