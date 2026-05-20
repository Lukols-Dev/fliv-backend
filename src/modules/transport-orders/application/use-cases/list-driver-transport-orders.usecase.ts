import { Inject, Injectable } from '@nestjs/common';
import {
  TRANSPORT_ORDER_REPOSITORY,
  type TransportOrderRepositoryPort,
  type ListTransportOrdersParams,
} from '../ports/transport-order.repository.port';
import { TransportOrder } from '../../domain/entities/transport-order.entity';
import { UserId } from '../../../users/domain/value-objects/user-id.vo';

export interface ListDriverOrdersInput extends ListTransportOrdersParams {
  currentUserId: string;
}

@Injectable()
export class ListDriverTransportOrdersUseCase {
  constructor(
    @Inject(TRANSPORT_ORDER_REPOSITORY)
    private readonly orderRepository: TransportOrderRepositoryPort,
  ) {}

  async execute(input: ListDriverOrdersInput): Promise<TransportOrder[]> {
    const driverId = new UserId(input.currentUserId);

    // TODO: ewentualnie tu możesz sprawdzić, czy user ma rolę DRIVER
    return this.orderRepository.listForDriver(driverId, input);
  }
}
