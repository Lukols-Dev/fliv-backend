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

export interface AssignTransportOrderToDriverInput {
  currentUserId: string;
  ztNumber: string;
}

@Injectable()
export class AssignTransportOrderToDriverUseCase {
  constructor(
    @Inject(TRANSPORT_ORDER_REPOSITORY)
    private readonly orderRepository: TransportOrderRepositoryPort,
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

    if (existing.assignedDriverUserId === driverId.value) {
      return existing;
    }

    return this.orderRepository.assignToDriver({
      orderId: existing.id,
      driverUserId: driverId,
    });
  }
}
