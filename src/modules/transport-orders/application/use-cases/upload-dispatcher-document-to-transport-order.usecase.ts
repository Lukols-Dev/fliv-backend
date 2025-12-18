import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { UploadDocumentUseCase } from 'src/modules/documents/application/use-cases/upload-document.usecase';
import { LocalFile } from 'src/modules/documents/application/ports/file-storage.port';
import {
  TRANSPORT_ORDER_REPOSITORY,
  type TransportOrderRepositoryPort,
} from '../ports/transport-order.repository.port';
import {
  ORDER_DOCUMENT_REPOSITORY,
  type OrderDocumentRepositoryPort,
} from '../ports/order-document.repository.port';
import { TransportOrderId } from '../../domain/value-objects/transport-order-id.vo';
import { UploadDriverOrderDocumentDto } from '../dto/upload-driver-order-document.dto';
import { Document } from 'src/modules/documents/domain/entities/document.entity';

export interface UploadDispatcherDocumentInput {
  currentUserId: string;
  orderId: string;
  file: LocalFile;
  payload: UploadDriverOrderDocumentDto;
}

@Injectable()
export class UploadDispatcherDocumentToTransportOrderUseCase {
  constructor(
    @Inject(TRANSPORT_ORDER_REPOSITORY)
    private readonly transportOrderRepository: TransportOrderRepositoryPort,
    private readonly uploadDocumentUseCase: UploadDocumentUseCase,
    @Inject(ORDER_DOCUMENT_REPOSITORY)
    private readonly orderDocumentRepository: OrderDocumentRepositoryPort,
  ) {}

  async execute(input: UploadDispatcherDocumentInput): Promise<Document> {
    const orderId = new TransportOrderId(input.orderId);

    const order = await this.transportOrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Transport order not found');
    }

    const document = await this.uploadDocumentUseCase.execute({
      currentUserId: input.currentUserId,
      file: input.file,
      payload: { description: undefined },
    });

    await this.orderDocumentRepository.attachToTransportOrder(orderId, {
      documentId: document.id.value,
      title: input.payload.title,
      source: 'DISPATCHER',
    });

    return document;
  }
}
