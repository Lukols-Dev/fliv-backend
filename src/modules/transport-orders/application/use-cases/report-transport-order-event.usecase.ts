import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserId } from 'src/modules/users/domain/value-objects/user-id.vo';
import {
  TRANSPORT_ORDER_REPOSITORY,
  type TransportOrderRepositoryPort,
} from '../ports/transport-order.repository.port';
import { TransportOrderId } from '../../domain/value-objects/transport-order-id.vo';
import {
  TRANSPORT_ORDER_EVENT_REPOSITORY,
  type TransportOrderEventRepositoryPort,
} from '../ports/transport-order-event.repository.port';
import { TransportOrder } from '../../domain/entities/transport-order.entity';
import { TransportOrderEventType } from '../../domain/value-objects/transport-order-event-type.vo';
import {
  NOTIFICATION_REPOSITORY,
  type NotificationRepositoryPort,
} from 'src/modules/notifications/application/ports/notification.repository.port';
import { NotificationType } from 'src/modules/notifications/domain/value-objects/notification-type.vo';

export interface ReportTransportOrderEventInput {
  currentUserId: string;
  orderId: string;
  eventType: TransportOrderEventType;
  description?: string | null;
}

@Injectable()
export class ReportTransportOrderEventUseCase {
  constructor(
    @Inject(TRANSPORT_ORDER_REPOSITORY)
    private readonly orderRepository: TransportOrderRepositoryPort,
    @Inject(TRANSPORT_ORDER_EVENT_REPOSITORY)
    private readonly eventRepository: TransportOrderEventRepositoryPort,
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepositoryPort,
  ) {}

  async execute(
    input: ReportTransportOrderEventInput,
  ): Promise<TransportOrder> {
    const orderId = new TransportOrderId(input.orderId);
    const userId = new UserId(input.currentUserId);

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Transport order not found');
    }

    if (order.assignedDriverUserId !== userId.value) {
      throw new ForbiddenException('Not allowed to modify this order');
    }

    const historyEntry = await this.eventRepository.record({
      orderId,
      previousStatus: order.status,
      newStatus: order.status,
      type: input.eventType,
      description: `${input.eventType}${
        input.description ? `: ${input.description}` : ''
      }`,
      userId,
    });

    await this.notificationRepository.create({
      userId: new UserId(order.createdByUserId),
      type: NotificationType.ORDER_EVENT,
      message: `Zlecenie ${order.ztNumber}: zgłoszono zdarzenie ${input.eventType} (${historyEntry.createdAt.toISOString()})`,
    });

    const reloaded = await this.orderRepository.findById(orderId);
    return reloaded ?? order;
  }
}
