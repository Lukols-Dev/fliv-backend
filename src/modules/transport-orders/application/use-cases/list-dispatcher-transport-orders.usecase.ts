import { Inject, Injectable } from '@nestjs/common';
import {
  TRANSPORT_ORDER_REPOSITORY,
  type TransportOrderRepositoryPort,
  type ListTransportOrdersParams,
} from '../ports/transport-order.repository.port';
import { TransportOrder } from '../../domain/entities/transport-order.entity';
import { UserId } from '../../../users/domain/value-objects/user-id.vo';

export interface ListDispatcherOrdersInput extends ListTransportOrdersParams {
  currentUserId: string;
}

@Injectable()
export class ListDispatcherTransportOrdersUseCase {
  constructor(
    @Inject(TRANSPORT_ORDER_REPOSITORY)
    private readonly orderRepository: TransportOrderRepositoryPort,
  ) {}

  async execute(input: ListDispatcherOrdersInput): Promise<TransportOrder[]> {
    const dispatcherId = new UserId(input.currentUserId);

    return this.orderRepository.listForDispatcher(dispatcherId, input);
  }
}
