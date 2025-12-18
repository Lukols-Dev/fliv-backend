import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  TRANSPORT_ORDER_REPOSITORY,
  type TransportOrderRepositoryPort,
} from '../ports/transport-order.repository.port';
import { TransportOrderId } from '../../domain/value-objects/transport-order-id.vo';
import { TransportOrder } from '../../domain/entities/transport-order.entity';

export interface GetDispatcherOrderInput {
  orderId: string;
}

@Injectable()
export class GetDispatcherTransportOrderUseCase {
  constructor(
    @Inject(TRANSPORT_ORDER_REPOSITORY)
    private readonly orderRepository: TransportOrderRepositoryPort,
  ) {}

  async execute(input: GetDispatcherOrderInput): Promise<TransportOrder> {
    const id = new TransportOrderId(input.orderId);
    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new NotFoundException('Transport order not found');
    }

    return order;
  }
}
