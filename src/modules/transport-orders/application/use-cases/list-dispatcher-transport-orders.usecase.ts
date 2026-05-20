import { Inject, Injectable } from '@nestjs/common';
import {
  TRANSPORT_ORDER_REPOSITORY,
  type TransportOrderRepositoryPort,
  type ListTransportOrdersParams,
  ListTransportOrdersResult,
} from '../ports/transport-order.repository.port';
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

  async execute(
    input: ListDispatcherOrdersInput,
  ): Promise<ListTransportOrdersResult> {
    const dispatcherId = new UserId(input.currentUserId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { currentUserId: _ignored, ...params } = input;
    return this.orderRepository.listForDispatcher(dispatcherId, params);
  }
}
