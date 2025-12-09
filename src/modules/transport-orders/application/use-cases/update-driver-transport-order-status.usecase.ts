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
import { TransportOrderStatus } from '../../domain/value-objects/transport-order-status.vo';
import {
  TRANSPORT_ORDER_EVENT_REPOSITORY,
  type TransportOrderEventRepositoryPort,
} from '../ports/transport-order-event.repository.port';
import {
  NOTIFICATION_REPOSITORY,
  type NotificationRepositoryPort,
} from 'src/modules/notifications/application/ports/notification.repository.port';
import { TransportOrderEventType } from '../../domain/value-objects/transport-order-event-type.vo';
import { TransportOrder } from '../../domain/entities/transport-order.entity';
import { NotificationType } from 'src/modules/notifications/domain/value-objects/notification-type.vo';

const ALLOWED_DRIVER_STATUSES: TransportOrderStatus[] = [
  TransportOrderStatus.ACCEPTED,
  TransportOrderStatus.IN_PROGRESS,
  TransportOrderStatus.LOADING,
  TransportOrderStatus.UNLOADING,
  TransportOrderStatus.PAUSED,
  TransportOrderStatus.COMPLETED,
  TransportOrderStatus.PROBLEM,
];

export interface UpdateDriverTransportOrderStatusInput {
  currentUserId: string;
  orderId: string;
  status: TransportOrderStatus;
  description?: string | null;
  actionOverride?: TransportOrderEventType;
}

@Injectable()
export class UpdateDriverTransportOrderStatusUseCase {
  constructor(
    @Inject(TRANSPORT_ORDER_REPOSITORY)
    private readonly orderRepository: TransportOrderRepositoryPort,
    @Inject(TRANSPORT_ORDER_EVENT_REPOSITORY)
    private readonly eventRepository: TransportOrderEventRepositoryPort,
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepositoryPort,
  ) {}

  async execute(
    input: UpdateDriverTransportOrderStatusInput,
  ): Promise<TransportOrder> {
    const orderId = new TransportOrderId(input.orderId);
    const currentUserId = new UserId(input.currentUserId);

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Transport order not found');
    }

    if (order.assignedDriverUserId !== currentUserId.value) {
      throw new ForbiddenException('Not allowed to modify this order');
    }

    if (!ALLOWED_DRIVER_STATUSES.includes(input.status)) {
      throw new ForbiddenException('Status change not allowed for driver');
    }

    if (
      input.status === TransportOrderStatus.PROBLEM &&
      !input.description?.trim()
    ) {
      throw new ForbiddenException('Problem description is required');
    }

    if (order.status === input.status) {
      return order;
    }

    const updated = await this.orderRepository.update(orderId, {
      status: input.status,
    });

    const eventType =
      input.actionOverride ?? this.mapAction(order.status, input.status);

    await this.eventRepository.record({
      orderId,
      previousStatus: order.status,
      newStatus: input.status,
      type: eventType,
      description: input.description,
      userId: currentUserId,
    });

    await this.notificationRepository.create({
      userId: new UserId(order.createdByUserId),
      type: NotificationType.ORDER_STATUS_CHANGED,
      message: `Zlecenie ${order.ztNumber} ma nowy status ${input.status} (${new Date().toISOString()})`,
    });

    const reloaded = await this.orderRepository.findById(orderId);
    return reloaded ?? updated;
  }

  private mapAction(
    previous: TransportOrderStatus,
    next: TransportOrderStatus,
  ): TransportOrderEventType {
    if (next === TransportOrderStatus.PROBLEM) {
      return TransportOrderEventType.PROBLEM_REPORTED;
    }

    if (next === TransportOrderStatus.PAUSED) {
      return TransportOrderEventType.ROUTE_PAUSED;
    }

    if (
      previous === TransportOrderStatus.PAUSED &&
      next === TransportOrderStatus.IN_PROGRESS
    ) {
      return TransportOrderEventType.ROUTE_RESUMED;
    }

    if (next === TransportOrderStatus.COMPLETED) {
      return TransportOrderEventType.ORDER_COMPLETED;
    }

    return TransportOrderEventType.STATUS_CHANGED;
  }
}
