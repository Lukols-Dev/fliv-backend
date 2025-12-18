import { Inject, Injectable } from '@nestjs/common';
import {
  TRANSPORT_ORDER_REPOSITORY,
  type TransportOrderRepositoryPort,
} from '../ports/transport-order.repository.port';
import { TransportOrderId } from '../../domain/value-objects/transport-order-id.vo';

export interface DeleteTransportOrderInput {
  orderId: string;
}

@Injectable()
export class DeleteTransportOrderUseCase {
  constructor(
    @Inject(TRANSPORT_ORDER_REPOSITORY)
    private readonly transportOrderRepository: TransportOrderRepositoryPort,
  ) {}

  async execute(input: DeleteTransportOrderInput): Promise<void> {
    const orderId = new TransportOrderId(input.orderId);

    const existing = await this.transportOrderRepository.findById(orderId);
    if (!existing) {
      // You can throw here or silently ignore
      throw new Error('Transport order does not exist');
    }

    await this.transportOrderRepository.delete(orderId);
  }
}
