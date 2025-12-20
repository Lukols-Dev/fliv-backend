import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserId } from 'src/modules/users/domain/value-objects/user-id.vo';

import { UploadDocumentUseCase } from 'src/modules/documents/application/use-cases/upload-document.usecase';
import { UploadDriverOrderDocumentDto } from '../dto/upload-driver-order-document.dto';
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

export interface UploadDriverDocumentInput {
  currentUserId: string;
  orderId: string;
  file: LocalFile;
  payload: UploadDriverOrderDocumentDto;
}

@Injectable()
export class UploadDriverDocumentToTransportOrderUseCase {
  constructor(
    @Inject(TRANSPORT_ORDER_REPOSITORY)
    private readonly transportOrderRepository: TransportOrderRepositoryPort,
    private readonly uploadDocumentUseCase: UploadDocumentUseCase,
    @Inject(ORDER_DOCUMENT_REPOSITORY)
    private readonly orderDocumentRepository: OrderDocumentRepositoryPort,
  ) {}

  async execute(input: UploadDriverDocumentInput): Promise<{
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
    const currentUserId = new UserId(input.currentUserId);

    const order = await this.transportOrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Transport order not found');
    }

    if (order.assignedDriverUserId !== currentUserId.value) {
      throw new ForbiddenException('Not allowed to modify this order');
    }

    const uploaded = await this.uploadDocumentUseCase.execute({
      file: input.file,
    });

    const attached = await this.orderDocumentRepository.attachToTransportOrder(
      orderId,
      {
        title: input.payload.title,
        source: 'DRIVER',
        url: uploaded.url,
        storageKey: uploaded.storageKey,
        mimeType: uploaded.mimeType,
        sizeBytes: uploaded.sizeBytes ?? null,
        originalFilename: uploaded.originalFilename ?? null,
        description: null,
        uploadedByUserId: currentUserId.value,
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
