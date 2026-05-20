import { TransportOrderStatus } from '../value-objects/transport-order-status.vo';
import { TransportOrderEventId } from '../value-objects/transport-order-event-id.vo';
import { TransportOrderEventType } from '../value-objects/transport-order-event-type.vo';

export class TransportOrderEvent {
  constructor(
    public readonly id: TransportOrderEventId,
    public readonly transportOrderId: string,
    public readonly type: TransportOrderEventType,
    public readonly previousStatus: TransportOrderStatus | null,
    public readonly newStatus: TransportOrderStatus | null,
    public readonly description: string | null,
    public readonly createdByUserId: string,
    public readonly createdAt: Date,
  ) {}
}
