import { Inject, Injectable } from '@nestjs/common';
import {
  ORDER_DOCUMENT_REPOSITORY,
  type OrderDocumentRepositoryPort,
} from '../ports/order-document.repository.port';

export interface DetachDocumentFromTransportOrderInput {
  orderDocumentId: string;
}

@Injectable()
export class DetachDocumentFromTransportOrderUseCase {
  constructor(
    @Inject(ORDER_DOCUMENT_REPOSITORY)
    private readonly orderDocumentRepository: OrderDocumentRepositoryPort,
  ) {}

  async execute(input: DetachDocumentFromTransportOrderInput): Promise<void> {
    await this.orderDocumentRepository.detachFromTransportOrder(
      input.orderDocumentId,
    );
  }
}
