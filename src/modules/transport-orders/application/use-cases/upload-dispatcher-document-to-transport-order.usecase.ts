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

  async execute(input: UploadDispatcherDocumentInput): Promise<{
    orderDocumentId: string;
    orderDocumentCreatedAt: Date;
    title: string | null;
    url: string;
    mimeType: string;
    sizeBytes: number | null;
    originalFilename: string | null;
    description: string | null;
  }> {
    const orderId = new TransportOrderId(input.orderId);

    const order = await this.transportOrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Transport order not found');
    }

    const uploaded = await this.uploadDocumentUseCase.execute({
      file: input.file,
    });

    const attached = await this.orderDocumentRepository.attachToTransportOrder(
      orderId,
      {
        title: input.payload.title,
        source: 'DISPATCHER',
        url: uploaded.url,
        storageKey: uploaded.storageKey,
        mimeType: uploaded.mimeType,
        sizeBytes: uploaded.sizeBytes ?? null,
        originalFilename: uploaded.originalFilename ?? null,
        description: null,
        uploadedByUserId: input.currentUserId,
      },
    );

    return {
      orderDocumentId: attached.orderDocumentId,
      orderDocumentCreatedAt: attached.createdAt,
      title: attached.title,
      url: attached.url,
      mimeType: attached.mimeType,
      sizeBytes: attached.sizeBytes,
      originalFilename: attached.originalFilename,
      description: attached.description,
    };
  }
}
