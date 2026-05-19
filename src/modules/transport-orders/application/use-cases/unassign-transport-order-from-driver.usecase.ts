import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  TRANSPORT_ORDER_REPOSITORY,
  type TransportOrderRepositoryPort,
} from '../ports/transport-order.repository.port';
import { UserId } from '../../../users/domain/value-objects/user-id.vo';
import { TransportOrderId } from '../../domain/value-objects/transport-order-id.vo';
import {
  TRANSPORT_ORDER_EVENT_REPOSITORY,
  type TransportOrderEventRepositoryPort,
} from '../ports/transport-order-event.repository.port';
import { TransportOrderStatus } from '../../domain/value-objects/transport-order-status.vo';
import { TransportOrderEventType } from '../../domain/value-objects/transport-order-event-type.vo';
import {
  NOTIFICATION_REPOSITORY,
  type NotificationRepositoryPort,
} from 'src/modules/notifications/application/ports/notification.repository.port';
import { NotificationType } from 'src/modules/notifications/domain/value-objects/notification-type.vo';

export interface UnassignTransportOrderFromDriverInput {
  currentUserId: string;
  orderId: string;
}

@Injectable()
export class UnassignTransportOrderFromDriverUseCase {
  constructor(
    @Inject(TRANSPORT_ORDER_REPOSITORY)
    private readonly orderRepository: TransportOrderRepositoryPort,
    @Inject(TRANSPORT_ORDER_EVENT_REPOSITORY)
    private readonly eventRepository: TransportOrderEventRepositoryPort,
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepositoryPort,
  ) {}

  async execute(input: UnassignTransportOrderFromDriverInput): Promise<void> {
    const driverId = new UserId(input.currentUserId);
    const orderId = new TransportOrderId(input.orderId);

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Transport order not found');
    }

    if (order.assignedDriverUserId !== driverId.value) {
      throw new ForbiddenException('Order is not assigned to you');
    }

    const previousStatus = order.status;

    await this.orderRepository.unassignFromDriver(orderId);

    await this.eventRepository.record({
      orderId,
      previousStatus,
      newStatus: TransportOrderStatus.PENDING,
      type: TransportOrderEventType.STATUS_CHANGED,
      description: 'Driver unassigned',
      userId: driverId,
    });

    if (order.createdByUserId) {
      await this.notificationRepository.create({
        userId: new UserId(order.createdByUserId),
        type: NotificationType.ORDER_STATUS_CHANGED,
        data: {
          zTNumber: order.ztNumber,
          status: TransportOrderStatus.PENDING,
        },
      });
    }
  }
}
