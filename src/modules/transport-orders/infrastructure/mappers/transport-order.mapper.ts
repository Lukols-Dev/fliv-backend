import type {
  TransportOrder as PrismaTransportOrder,
  OrderDocument as PrismaTransportOrderDocument,
  TransportOrderEvent as PrismaTransportOrderEvent,
  TransportOrderStatus as PrismaTransportOrderStatus,
  TransportOrderEventType as PrismaTransportOrderEventType,
} from 'generated/prisma/client';
import { TransportOrder } from '../../domain/entities/transport-order.entity';
import { TransportOrderId } from '../../domain/value-objects/transport-order-id.vo';
import { TransportOrderStatus } from '../../domain/value-objects/transport-order-status.vo';
import { TransportOrderDocument } from '../../domain/entities/transport-order-document.entity';
import { TransportOrderDocumentId } from '../../domain/value-objects/transport-order-document-id.vo';
import { TransportOrderEvent } from '../../domain/entities/transport-order-event.entity';
import { TransportOrderEventId } from '../../domain/value-objects/transport-order-event-id.vo';
import { TransportOrderEventType } from '../../domain/value-objects/transport-order-event-type.vo';

type TransportOrderWithDocuments = PrismaTransportOrder & {
  orderDocuments: PrismaTransportOrderDocument[];
  events?: PrismaTransportOrderEvent[];
};

export class TransportOrderMapper {
  static toDomain(record: TransportOrderWithDocuments): TransportOrder {
    const documents = record.orderDocuments.map(
      (orderDoc) =>
        new TransportOrderDocument(
          new TransportOrderDocumentId(orderDoc.id),
          orderDoc.title ?? null,
          orderDoc.createdAt,
          orderDoc.url,
          orderDoc.mimeType,
          orderDoc.sizeBytes ?? null,
          orderDoc.originalFilename ?? null,
          orderDoc.description ?? null,
        ),
    );

    const assignedDriver =
      record.assignedDriverUserId != null ? record.assignedDriverUserId : null;

    return new TransportOrder(
      new TransportOrderId(record.id),
      record.ztNumber,
      record.pwNumber,
      mapPrismaStatus(record.status),
      record.vehiclePlate,
      record.trailerPlate,
      record.driverFirstName,
      record.driverLastName,
      record.driverPhone,
      record.clientName,
      record.contractNumber,
      record.payerName,
      record.payerVatId,
      record.payerEmail,
      record.fromCountry,
      record.toCountry,
      record.cargoWeightKg,
      record.loadingDate,
      record.cargoDescription,
      record.temperatureSensitive,
      record.notes,
      record.createdByUserId,
      assignedDriver,
      record.createdAt,
      record.updatedAt,
      documents,
      mapEvents(record.events),
    );
  }
}

type TransportOrderEventRow = {
  id: string;
  transportOrderId: string;
  type: PrismaTransportOrderEventType;
  previousStatus: PrismaTransportOrderStatus | null;
  newStatus: PrismaTransportOrderStatus | null;
  description: string | null;
  createdByUserId: string;
  createdAt: Date;
};

function mapEvents(
  events: TransportOrderEventRow[] | undefined,
): TransportOrderEvent[] {
  return (events ?? []).map(
    (event) =>
      new TransportOrderEvent(
        new TransportOrderEventId(event.id),
        event.transportOrderId,
        mapPrismaEventType(event.type),
        mapPrismaStatusNullable(event.previousStatus),
        mapPrismaStatusNullable(event.newStatus),
        event.description ?? null,
        event.createdByUserId,
        event.createdAt,
      ),
  );
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
    default: {
      // Exhaustiveness guard
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

function mapPrismaStatusNullable(
  status: PrismaTransportOrderStatus | null,
): TransportOrderStatus | null {
  return status ? mapPrismaStatus(status) : null;
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
