import type {
  TransportOrderEventType as PrismaTransportOrderEventType,
  TransportOrderStatus as PrismaTransportOrderStatus,
} from 'generated/prisma/client';
import { TransportOrderEvent } from '../../domain/entities/transport-order-event.entity';
import { TransportOrderEventId } from '../../domain/value-objects/transport-order-event-id.vo';
import { TransportOrderEventType } from '../../domain/value-objects/transport-order-event-type.vo';
import { TransportOrderStatus } from '../../domain/value-objects/transport-order-status.vo';

type TransportOrderEventRecord = {
  id: string;
  transportOrderId: string;
  type: PrismaTransportOrderEventType;
  previousStatus: PrismaTransportOrderStatus | null;
  newStatus: PrismaTransportOrderStatus | null;
  description: string | null;
  createdByUserId: string;
  createdAt: Date;
};

export class TransportOrderEventMapper {
  static toDomain(record: TransportOrderEventRecord): TransportOrderEvent {
    return new TransportOrderEvent(
      new TransportOrderEventId(record.id),
      record.transportOrderId,
      mapPrismaEventType(record.type),
      mapPrismaStatusNullable(record.previousStatus),
      mapPrismaStatusNullable(record.newStatus),
      record.description ?? null,
      record.createdByUserId,
      record.createdAt,
    );
  }
}

function mapPrismaStatusNullable(
  status: PrismaTransportOrderStatus | null,
): TransportOrderStatus | null {
  if (!status) {
    return null;
  }

  return mapPrismaStatus(status);
}

function mapPrismaStatus(
  status: PrismaTransportOrderStatus,
): TransportOrderStatus {
  switch (status) {
    case 'PENDING':
      return TransportOrderStatus.PENDING;
    case 'ACCEPTED':
      return TransportOrderStatus.ACCEPTED;
    case 'IN_PROGRESS':
      return TransportOrderStatus.IN_PROGRESS;
    case 'LOADING':
      return TransportOrderStatus.LOADING;
    case 'UNLOADING':
      return TransportOrderStatus.UNLOADING;
    case 'PAUSED':
      return TransportOrderStatus.PAUSED;
    case 'COMPLETED':
      return TransportOrderStatus.COMPLETED;
    case 'PROBLEM':
      return TransportOrderStatus.PROBLEM;
    default:
      throw new Error(
        `Unsupported transport order status: ${status as string}`,
      );
  }
}

function mapPrismaEventType(
  type: PrismaTransportOrderEventType,
): TransportOrderEventType {
  switch (type) {
    case 'STATUS_CHANGED':
      return TransportOrderEventType.STATUS_CHANGED;
    case 'INCIDENT_DETOUR':
      return TransportOrderEventType.INCIDENT_DETOUR;
    case 'INCIDENT_ACCIDENT':
      return TransportOrderEventType.INCIDENT_ACCIDENT;
    case 'INCIDENT_DELAY':
      return TransportOrderEventType.INCIDENT_DELAY;
    case 'ROUTE_PAUSED':
      return TransportOrderEventType.ROUTE_PAUSED;
    case 'ROUTE_RESUMED':
      return TransportOrderEventType.ROUTE_RESUMED;
    case 'ROUTE_FINISHED':
      return TransportOrderEventType.ROUTE_FINISHED;
    case 'PROBLEM_REPORTED':
      return TransportOrderEventType.PROBLEM_REPORTED;
    case 'ORDER_ASSIGNED':
      return TransportOrderEventType.ORDER_ASSIGNED;
    case 'ORDER_COMPLETED':
      return TransportOrderEventType.ORDER_COMPLETED;
    default:
      throw new Error(
        `Unsupported transport order event type: ${type as string}`,
      );
  }
}
