import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ORDER_DOCUMENT_REPOSITORY,
  type OrderDocumentRepositoryPort,
} from '../ports/order-document.repository.port';
import { DeleteDocumentUseCase } from 'src/modules/documents/application/use-cases/delete-document.usecase';

export interface DetachDocumentFromTransportOrderInput {
  orderDocumentId: string;
}

@Injectable()
export class DetachDocumentFromTransportOrderUseCase {
  constructor(
    @Inject(ORDER_DOCUMENT_REPOSITORY)
    private readonly orderDocumentRepository: OrderDocumentRepositoryPort,
    private readonly deleteDocumentUseCase: DeleteDocumentUseCase,
  ) {}

  async execute(input: DetachDocumentFromTransportOrderInput): Promise<void> {
    const storageKey =
      await this.orderDocumentRepository.findStorageKeyByOrderDocumentId(
        input.orderDocumentId,
      );
    if (!storageKey) {
      throw new NotFoundException('Order document not found');
    }

    // Best-effort storage cleanup. If file delete fails, we still want to detach.
    try {
      await this.deleteDocumentUseCase.execute({ storageKey });
    } catch {
      // ignore
    }

    await this.orderDocumentRepository.deleteOrderDocument(
      input.orderDocumentId,
    );
  }
}
