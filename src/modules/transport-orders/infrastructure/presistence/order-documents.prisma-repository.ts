import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  type AttachOrderDocumentInput,
  type AttachedOrderDocumentResult,
  type OrderDocumentRepositoryPort,
} from '../../application/ports/order-document.repository.port';
import { TransportOrderId } from '../../domain/value-objects/transport-order-id.vo';

type CreatedOrderDocumentRow = {
  id: string;
  createdAt: Date;
  title: string | null;
  url: string;
  mimeType: string;
  sizeBytes: number | null;
  originalFilename: string | null;
  description: string | null;
};

@Injectable()
export class OrderDocumentsPrismaRepository
  implements OrderDocumentRepositoryPort
{
  constructor(private readonly prisma: PrismaService) {}

  async attachToTransportOrder(
    orderId: TransportOrderId,
    input: AttachOrderDocumentInput,
  ): Promise<AttachedOrderDocumentResult> {
    const created = (await this.prisma.orderDocument.create({
      data: {
        transportOrderId: orderId.value,
        source: input.source,
        title: input.title ?? null,
        url: input.url,
        storageKey: input.storageKey,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes ?? null,
        originalFilename: input.originalFilename ?? null,
        description: input.description ?? null,
        uploadedByUserId: input.uploadedByUserId ?? null,
      },
      select: {
        id: true,
        createdAt: true,
        title: true,
        url: true,
        mimeType: true,
        sizeBytes: true,
        originalFilename: true,
        description: true,
      },
    })) as CreatedOrderDocumentRow;
    return {
      orderDocumentId: created.id,
      createdAt: created.createdAt,
      title: created.title ?? null,
      url: created.url,
      mimeType: created.mimeType,
      sizeBytes: created.sizeBytes ?? null,
      originalFilename: created.originalFilename ?? null,
      description: created.description ?? null,
    };
  }

  async findStorageKeyByOrderDocumentId(
    orderDocumentId: string,
  ): Promise<string | null> {
    const row = (await this.prisma.orderDocument.findUnique({
      where: { id: orderDocumentId },
      select: { storageKey: true },
    })) as { storageKey: string } | null;
    return row ? row.storageKey : null;
  }

  async deleteOrderDocument(orderDocumentId: string): Promise<void> {
    await this.prisma.orderDocument.delete({
      where: { id: orderDocumentId },
      select: { id: true },
    });
  }
}
