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
import { TransportOrderId } from '../../domain/value-objects/transport-order-id.vo';
import { TransportOrder } from '../../domain/entities/transport-order.entity';

export interface GetDriverOrderInput {
  currentUserId: string;
  orderId: string;
}

@Injectable()
export class GetDriverTransportOrderUseCase {
  constructor(
    @Inject(TRANSPORT_ORDER_REPOSITORY)
    private readonly orderRepository: TransportOrderRepositoryPort,
  ) {}

  async execute(input: GetDriverOrderInput): Promise<TransportOrder> {
    const id = new TransportOrderId(input.orderId);

    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new NotFoundException('Transport order not found');
    }

    if (order.assignedDriverUserId !== input.currentUserId) {
      throw new ForbiddenException('Not allowed to access this order');
    }

    return order;
  }
}
