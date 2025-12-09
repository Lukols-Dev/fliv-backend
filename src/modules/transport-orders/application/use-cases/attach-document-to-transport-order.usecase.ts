import { Inject, Injectable } from '@nestjs/common';
import {
  ORDER_DOCUMENT_REPOSITORY,
  type OrderDocumentRepositoryPort,
} from '../ports/order-document.repository.port';
import { AttachDocumentDto } from '../dto/attach-document.dto';
import { TransportOrderId } from '../../domain/value-objects/transport-order-id.vo';

export interface AttachDocumentToTransportOrderInput {
  orderId: string;
  payload: AttachDocumentDto;
  source: 'DRIVER' | 'DISPATCHER' | 'SYSTEM';
}

@Injectable()
export class AttachDocumentToTransportOrderUseCase {
  constructor(
    @Inject(ORDER_DOCUMENT_REPOSITORY)
    private readonly orderDocumentRepository: OrderDocumentRepositoryPort,
  ) {}

  async execute(input: AttachDocumentToTransportOrderInput): Promise<void> {
    const orderId = new TransportOrderId(input.orderId);

    await this.orderDocumentRepository.attachToTransportOrder(orderId, {
      documentId: input.payload.documentId,
      title: input.payload.title ?? null,
      source: input.source,
    });
  }
}
