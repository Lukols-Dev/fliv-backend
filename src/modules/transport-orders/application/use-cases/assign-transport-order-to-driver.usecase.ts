import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  TRANSPORT_ORDER_REPOSITORY,
  type TransportOrderRepositoryPort,
} from '../ports/transport-order.repository.port';
import { UserId } from '../../../users/domain/value-objects/user-id.vo';
import { TransportOrder } from '../../domain/entities/transport-order.entity';
import {
  TRANSPORT_ORDER_EVENT_REPOSITORY,
  type TransportOrderEventRepositoryPort,
} from '../ports/transport-order-event.repository.port';
import { TransportOrderStatus } from '../../domain/value-objects/transport-order-status.vo';
import {
  NOTIFICATION_REPOSITORY,
  type NotificationRepositoryPort,
} from 'src/modules/notifications/application/ports/notification.repository.port';
import { TransportOrderEventType } from '../../domain/value-objects/transport-order-event-type.vo';
import { NotificationType } from 'src/modules/notifications/domain/value-objects/notification-type.vo';

export interface AssignTransportOrderToDriverInput {
  currentUserId: string;
  ztNumber: string;
}

@Injectable()
export class AssignTransportOrderToDriverUseCase {
  constructor(
    @Inject(TRANSPORT_ORDER_REPOSITORY)
    private readonly orderRepository: TransportOrderRepositoryPort,
    @Inject(TRANSPORT_ORDER_EVENT_REPOSITORY)
    private readonly eventRepository: TransportOrderEventRepositoryPort,
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepositoryPort,
  ) {}

  async execute(
    input: AssignTransportOrderToDriverInput,
  ): Promise<TransportOrder> {
    const driverId = new UserId(input.currentUserId);

    const existing = await this.orderRepository.findByZtNumber(input.ztNumber);
    if (!existing) {
      throw new NotFoundException('Transport order not found');
    }

    if (
      existing.assignedDriverUserId &&
      existing.assignedDriverUserId !== driverId.value
    ) {
      throw new ConflictException('Transport order is already assigned');
    }

    const alreadyAssigned = existing.assignedDriverUserId === driverId.value;

    const assignedOrder = alreadyAssigned
      ? existing
      : await this.orderRepository.assignToDriver({
          orderId: existing.id,
          driverUserId: driverId,
        });

    const previousStatus = assignedOrder.status;
    let currentOrder = assignedOrder;

    if (assignedOrder.status !== TransportOrderStatus.ACCEPTED) {
      currentOrder = await this.orderRepository.update(assignedOrder.id, {
        status: TransportOrderStatus.ACCEPTED,
      });

      await this.eventRepository.record({
        orderId: assignedOrder.id,
        previousStatus,
        newStatus: TransportOrderStatus.ACCEPTED,
        type: TransportOrderEventType.ORDER_ASSIGNED,
        description: null,
        userId: driverId,
      });

      await this.notificationRepository.create({
        userId: new UserId(assignedOrder.createdByUserId),
        type: NotificationType.ORDER_STATUS_CHANGED,
        data: {
          zTNumber: assignedOrder.ztNumber,
          status: TransportOrderStatus.ACCEPTED,
        },
      });

      const reloaded = await this.orderRepository.findById(assignedOrder.id);
      return reloaded ?? currentOrder;
    }

    return currentOrder;
  }
}
