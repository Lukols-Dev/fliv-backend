import type {
  TransportOrder as PrismaTransportOrder,
  OrderDocument as PrismaTransportOrderDocument,
  TransportOrderEvent as PrismaTransportOrderEvent,
  TransportOrderStatus as PrismaTransportOrderStatus,
  TransportOrderEventType as PrismaTransportOrderEventType,
  TransportOrderRoutePlan as PrismaTransportOrderRoutePlan,
  TransportOrderRoutePoint as PrismaTransportOrderRoutePoint,
  TransportOrderRoutePointBehavior as PrismaTransportOrderRoutePointBehavior,
  TransportOrderRoutePointSource as PrismaTransportOrderRoutePointSource,
  TransportOrderRoutePointType as PrismaTransportOrderRoutePointType,
} from 'generated/prisma/client';
import { TransportOrder } from '../../domain/entities/transport-order.entity';
import { TransportOrderId } from '../../domain/value-objects/transport-order-id.vo';
import { TransportOrderStatus } from '../../domain/value-objects/transport-order-status.vo';
import { TransportOrderDocument } from '../../domain/entities/transport-order-document.entity';
import { TransportOrderDocumentId } from '../../domain/value-objects/transport-order-document-id.vo';
import { TransportOrderEvent } from '../../domain/entities/transport-order-event.entity';
import { TransportOrderEventId } from '../../domain/value-objects/transport-order-event-id.vo';
import { TransportOrderEventType } from '../../domain/value-objects/transport-order-event-type.vo';
import { TransportOrderRoutePlan } from '../../domain/entities/transport-order-route-plan.entity';
import { TransportOrderRoutePoint } from '../../domain/entities/transport-order-route-point.entity';
import { TransportOrderRoutePointBehavior } from '../../domain/value-objects/transport-order-route-point-behavior.vo';
import { TransportOrderRoutePointSource } from '../../domain/value-objects/transport-order-route-point-source.vo';
import { TransportOrderRoutePointType } from '../../domain/value-objects/transport-order-route-point-type.vo';

type TransportOrderWithDocuments = PrismaTransportOrder & {
  orderDocuments: PrismaTransportOrderDocument[];
  events?: PrismaTransportOrderEvent[];
  routePoints?: PrismaTransportOrderRoutePoint[];
  routePlan?: PrismaTransportOrderRoutePlan | null;
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
      record.timelinessStatus ?? null,
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
      record.fromAddress ?? null,
      record.toCountry,
      record.toAddress ?? null,
      record.cargoWeightKg,
      record.loadingDate,
      record.loadingTime ?? null,
      record.cargoDescription,
      record.temperatureSensitive,
      record.notes,
      record.createdByUserId,
      assignedDriver,
      record.createdAt,
      record.updatedAt,
      documents,
      mapEvents(record.events),
      mapRoutePoints(record.routePoints),
      mapRoutePlan(record.routePlan),
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

function mapRoutePoints(
  routePoints: PrismaTransportOrderRoutePoint[] | undefined,
): TransportOrderRoutePoint[] {
  return (routePoints ?? []).map(
    (point) =>
      new TransportOrderRoutePoint(
        point.id,
        point.sequence,
        mapPrismaRoutePointType(point.type),
        mapPrismaRoutePointBehavior(point.behavior),
        mapPrismaRoutePointSource(point.source),
        point.isManual,
        point.label ?? null,
        point.address ?? null,
        point.latitude,
        point.longitude,
        point.arrivedAt ?? null,
        point.arrivalLatitude ?? null,
        point.arrivalLongitude ?? null,
      ),
  );
}

function mapRoutePlan(
  routePlan: PrismaTransportOrderRoutePlan | null | undefined,
): TransportOrderRoutePlan | null {
  if (!routePlan) return null;

  return new TransportOrderRoutePlan(
    routePlan.routingProfile,
    routePlan.vehicleSpec ?? null,
    routePlan.distanceMeters,
    routePlan.durationSeconds,
    routePlan.polyline,
    routePlan.calculationHash,
    routePlan.calculatedAt,
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

function mapPrismaRoutePointType(
  type: PrismaTransportOrderRoutePointType,
): TransportOrderRoutePointType {
  switch (type) {
    case 'LOADING':
      return TransportOrderRoutePointType.LOADING;
    case 'UNLOADING':
      return TransportOrderRoutePointType.UNLOADING;
    case 'FUEL':
      return TransportOrderRoutePointType.FUEL;
    case 'PARKING':
      return TransportOrderRoutePointType.PARKING;
    case 'SERVICE':
      return TransportOrderRoutePointType.SERVICE;
    case 'OTHER':
      return TransportOrderRoutePointType.OTHER;
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

function mapPrismaRoutePointBehavior(
  behavior: PrismaTransportOrderRoutePointBehavior,
): TransportOrderRoutePointBehavior {
  switch (behavior) {
    case 'STOP':
      return TransportOrderRoutePointBehavior.STOP;
    case 'PASS_THROUGH':
      return TransportOrderRoutePointBehavior.PASS_THROUGH;
    default: {
      const _exhaustive: never = behavior;
      return _exhaustive;
    }
  }
}

function mapPrismaRoutePointSource(
  source: PrismaTransportOrderRoutePointSource,
): TransportOrderRoutePointSource {
  switch (source) {
    case 'DISPATCHER':
      return TransportOrderRoutePointSource.DISPATCHER;
    case 'SYSTEM':
      return TransportOrderRoutePointSource.SYSTEM;
    case 'HERE':
      return TransportOrderRoutePointSource.HERE;
    default: {
      const _exhaustive: never = source;
      return _exhaustive;
    }
  }
}
