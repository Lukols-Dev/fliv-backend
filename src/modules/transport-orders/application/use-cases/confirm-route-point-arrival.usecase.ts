import {
  ConflictException,
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

export interface ConfirmRoutePointArrivalInput {
  currentUserId: string;
  orderId: string;
  routePointId: string;
  sequence: number;
  confirmedAt: Date;
  latitude: number;
  longitude: number;
}

export interface ConfirmRoutePointArrivalResult {
  routePointId: string;
  sequence: number;
  arrivedAt: Date;
}

@Injectable()
export class ConfirmRoutePointArrivalUseCase {
  constructor(
    @Inject(TRANSPORT_ORDER_REPOSITORY)
    private readonly orderRepository: TransportOrderRepositoryPort,
  ) {}

  async execute(
    input: ConfirmRoutePointArrivalInput,
  ): Promise<ConfirmRoutePointArrivalResult> {
    const orderId = new TransportOrderId(input.orderId);
    const userId = new UserId(input.currentUserId);

    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Transport order not found');
    }

    if (order.assignedDriverUserId !== userId.value) {
      throw new ForbiddenException('Not allowed to modify this order');
    }

    const inactive: TransportOrderStatus[] = [
      TransportOrderStatus.COMPLETED,
      TransportOrderStatus.PENDING,
    ];
    if (inactive.includes(order.status)) {
      throw new ConflictException('Transport order is not active');
    }

    const point = order.routePoints.find((p) => p.id === input.routePointId);
    if (!point) {
      throw new NotFoundException('Route point not found on this order');
    }

    if (point.arrivedAt) {
      return {
        routePointId: point.id,
        sequence: point.sequence,
        arrivedAt: point.arrivedAt,
      };
    }

    await this.orderRepository.recordRoutePointArrival({
      routePointId: input.routePointId,
      arrivedAt: input.confirmedAt,
      arrivalLatitude: input.latitude,
      arrivalLongitude: input.longitude,
    });

    return {
      routePointId: input.routePointId,
      sequence: input.sequence,
      arrivedAt: input.confirmedAt,
    };
  }
}
