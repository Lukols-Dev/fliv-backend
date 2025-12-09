import { UserId } from 'src/modules/users/domain/value-objects/user-id.vo';
import { TransportOrderEvent } from '../../domain/entities/transport-order-event.entity';
import { TransportOrderId } from '../../domain/value-objects/transport-order-id.vo';
import { TransportOrderStatus } from '../../domain/value-objects/transport-order-status.vo';
import { TransportOrderEventType } from '../../domain/value-objects/transport-order-event-type.vo';

export const TRANSPORT_ORDER_EVENT_REPOSITORY = Symbol(
  'TRANSPORT_ORDER_EVENT_REPOSITORY',
);

export interface RecordTransportOrderEventInput {
  orderId: TransportOrderId;
  previousStatus: TransportOrderStatus | null;
  newStatus: TransportOrderStatus | null;
  type: TransportOrderEventType;
  description?: string | null;
  userId: UserId;
}

export interface TransportOrderEventRepositoryPort {
  record(input: RecordTransportOrderEventInput): Promise<TransportOrderEvent>;

  list(orderId: TransportOrderId): Promise<TransportOrderEvent[]>;
}
