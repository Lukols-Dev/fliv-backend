import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  type AttachOrderDocumentInput,
  type OrderDocumentRepositoryPort,
} from '../../application/ports/order-document.repository.port';
import { TransportOrderId } from '../../domain/value-objects/transport-order-id.vo';

@Injectable()
export class OrderDocumentsPrismaRepository
  implements OrderDocumentRepositoryPort
{
  constructor(private readonly prisma: PrismaService) {}

  async attachToTransportOrder(
    orderId: TransportOrderId,
    input: AttachOrderDocumentInput,
  ): Promise<void> {
    await this.prisma.orderDocument.create({
      data: {
        transportOrderId: orderId.value,
        documentId: input.documentId,
        source: input.source,
        title: input.title ?? null,
      },
    });
  }

  async detachFromTransportOrder(orderDocumentId: string): Promise<void> {
    await this.prisma.orderDocument.delete({
      where: { id: orderDocumentId },
    });
  }
}
