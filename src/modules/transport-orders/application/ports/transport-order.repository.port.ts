import { UserId } from 'src/modules/users/domain/value-objects/user-id.vo';
import type { TransportOrder } from '../../domain/entities/transport-order.entity';
import { TransportOrderId } from '../../domain/value-objects/transport-order-id.vo';
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
  cargoDescription?: string | null;
  temperatureSensitive: boolean;
  notes?: string | null;
  createdByUserId: string;
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
  cargoDescription?: string | null;
  temperatureSensitive?: boolean;
  notes?: string | null;
  status?: TransportOrderStatus;
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
  ): Promise<TransportOrder[]>;

  listForDriver(
    driverId: UserId,
    params?: ListTransportOrdersParams,
  ): Promise<TransportOrder[]>;

  assignToDriver(params: AssignDriverParams): Promise<TransportOrder>;
}
