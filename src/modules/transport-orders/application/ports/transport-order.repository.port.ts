import { UserId } from 'src/modules/users/domain/value-objects/user-id.vo';
import type { TransportOrder } from '../../domain/entities/transport-order.entity';
import { TransportOrderId } from '../../domain/value-objects/transport-order-id.vo';
import { TransportOrderRoutePointBehavior } from '../../domain/value-objects/transport-order-route-point-behavior.vo';
import { TransportOrderRoutePointSource } from '../../domain/value-objects/transport-order-route-point-source.vo';
import { TransportOrderRoutePointType } from '../../domain/value-objects/transport-order-route-point-type.vo';
import { TransportOrderStatus } from '../../domain/value-objects/transport-order-status.vo';

export const TRANSPORT_ORDER_REPOSITORY = Symbol('TRANSPORT_ORDER_REPOSITORY');

export interface CreateTransportOrderInput {
  ztNumber: string;
  pwNumber?: string | null;
  timelinessStatus?: string | null;
  vehiclePlate: string;
  trailerPlate?: string | null;
  driverFirstName: string;
  driverLastName: string;
  driverPhone: string;
  clientName: string;
  contractNumber?: string | null;
  payerName?: string | null;
  payerVatId?: string | null;
  payerEmail?: string | null;
  fromCountry: string;
  fromAddress?: string | null;
  toCountry: string;
  toAddress?: string | null;
  cargoWeightKg?: number | null;
  loadingDate?: Date | null;
  loadingTime?: string | null;
  cargoDescription?: string | null;
  temperatureSensitive: boolean;
  notes?: string | null;
  createdByUserId: string;
  routePoints?: TransportOrderRoutePointInput[];
}

export interface UpdateTransportOrderInput {
  ztNumber?: string;
  pwNumber?: string | null;
  vehiclePlate?: string;
  trailerPlate?: string | null;
  driverFirstName?: string;
  driverLastName?: string;
  driverPhone?: string;
  clientName?: string;
  contractNumber?: string | null;
  payerName?: string | null;
  payerVatId?: string | null;
  payerEmail?: string | null;
  fromCountry?: string;
  fromAddress?: string | null;
  toCountry?: string;
  toAddress?: string | null;
  cargoWeightKg?: number | null;
  loadingDate?: Date | null;
  loadingTime?: string | null;
  cargoDescription?: string | null;
  temperatureSensitive?: boolean;
  notes?: string | null;
  status?: TransportOrderStatus;
  routePoints?: TransportOrderRoutePointInput[];
}

export interface TransportOrderRoutePointInput {
  sequence: number;
  type: TransportOrderRoutePointType;
  behavior?: TransportOrderRoutePointBehavior;
  source?: TransportOrderRoutePointSource;
  isManual?: boolean;
  label?: string | null;
  address?: string | null;
  latitude: number;
  longitude: number;
}

export interface ListTransportOrdersParams {
  status?: string;
  page?: number;
  limit?: number;
}

export interface AssignDriverParams {
  orderId: TransportOrderId;
  driverUserId: UserId;
}

export type ListTransportOrdersResult = {
  items: TransportOrder[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export interface RecordRoutePointArrivalParams {
  routePointId: string;
  arrivedAt: Date;
  arrivalLatitude: number;
  arrivalLongitude: number;
}

export interface TransportOrderRepositoryPort {
  findById(id: TransportOrderId): Promise<TransportOrder | null>;
  findByZtNumber(ztNumber: string): Promise<TransportOrder | null>;

  create(input: CreateTransportOrderInput): Promise<TransportOrder>;

  update(
    id: TransportOrderId,
    input: UpdateTransportOrderInput,
  ): Promise<TransportOrder>;

  delete(id: TransportOrderId): Promise<void>;

  listForDispatcher(
    dispatcherId: UserId,
    params?: ListTransportOrdersParams,
  ): Promise<ListTransportOrdersResult>;

  listForDriver(
    driverId: UserId,
    params?: ListTransportOrdersParams,
  ): Promise<TransportOrder[]>;

  assignToDriver(params: AssignDriverParams): Promise<TransportOrder>;

  unassignFromDriver(orderId: TransportOrderId): Promise<TransportOrder>;

  recordRoutePointArrival(
    params: RecordRoutePointArrivalParams,
  ): Promise<void>;
}
