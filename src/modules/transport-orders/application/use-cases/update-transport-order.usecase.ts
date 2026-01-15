import { Inject, Injectable } from '@nestjs/common';
import { UpdateTransportOrderDto } from '../dto/update-transport-order.dto';
import {
  TRANSPORT_ORDER_REPOSITORY,
  type TransportOrderRepositoryPort,
} from '../ports/transport-order.repository.port';
import { TransportOrderId } from '../../domain/value-objects/transport-order-id.vo';
import { TransportOrder } from '../../domain/entities/transport-order.entity';
import {
  TRANSPORT_ORDER_EVENT_REPOSITORY,
  type TransportOrderEventRepositoryPort,
} from '../ports/transport-order-event.repository.port';
import {
  NOTIFICATION_REPOSITORY,
  type NotificationRepositoryPort,
} from 'src/modules/notifications/application/ports/notification.repository.port';
import { UserId } from 'src/modules/users/domain/value-objects/user-id.vo';
import { TransportOrderEventType } from '../../domain/value-objects/transport-order-event-type.vo';
import { NotificationType } from 'src/modules/notifications/domain/value-objects/notification-type.vo';
import { TransportOrderStatus } from '../../domain/value-objects/transport-order-status.vo';

export interface UpdateTransportOrderInput {
  orderId: string;
  payload: UpdateTransportOrderDto;
}

@Injectable()
export class UpdateTransportOrderUseCase {
  constructor(
    @Inject(TRANSPORT_ORDER_REPOSITORY)
    private readonly transportOrderRepository: TransportOrderRepositoryPort,
    @Inject(TRANSPORT_ORDER_EVENT_REPOSITORY)
    private readonly eventRepository: TransportOrderEventRepositoryPort,
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepositoryPort,
  ) {}

  async execute(input: UpdateTransportOrderInput): Promise<TransportOrder> {
    const orderId = new TransportOrderId(input.orderId);

    const existing = await this.transportOrderRepository.findById(orderId);
    if (!existing) {
      throw new Error('Transport order does not exist');
    }

    const loadingDate =
      input.payload.loadingDate != null
        ? new Date(input.payload.loadingDate)
        : undefined;

    const previousStatus = existing.status;

    const updated = await this.transportOrderRepository.update(orderId, {
      ztNumber: input.payload.ztNumber,
      pwNumber: input.payload.pwNumber,
      vehiclePlate: input.payload.vehiclePlate,
      trailerPlate: input.payload.trailerPlate,
      driverFirstName: input.payload.driverFirstName,
      driverLastName: input.payload.driverLastName,
      driverPhone: input.payload.driverPhone,
      clientName: input.payload.clientName,
      contractNumber: input.payload.contractNumber,
      payerName: input.payload.payerName,
      payerVatId: input.payload.payerVatId,
      payerEmail: input.payload.payerEmail,
      fromCountry: input.payload.fromCountry,
      fromAddress: input.payload.fromAddress,
      toCountry: input.payload.toCountry,
      toAddress: input.payload.toAddress,
      cargoWeightKg: input.payload.cargoWeightKg,
      loadingDate,
      loadingTime: input.payload.loadingTime,
      cargoDescription: input.payload.cargoDescription,
      temperatureSensitive: input.payload.temperatureSensitive,
      notes: input.payload.notes,
      status: input.payload.status,
    });

    if (input.payload.status && input.payload.status !== previousStatus) {
      const actingUserId = new UserId(existing.createdByUserId);
      const eventType =
        input.payload.status === TransportOrderStatus.COMPLETED
          ? TransportOrderEventType.ORDER_COMPLETED
          : TransportOrderEventType.STATUS_CHANGED;

      await this.eventRepository.record({
        orderId,
        previousStatus,
        newStatus: input.payload.status,
        type: eventType,
        description: null,
        userId: actingUserId,
      });

      await this.notificationRepository.create({
        userId: actingUserId,
        type: NotificationType.ORDER_STATUS_CHANGED,
        message: `Zlecenie ${updated.ztNumber} ma nowy status ${updated.status} (${new Date().toISOString()})`,
      });
    }

    return updated;
  }
}
