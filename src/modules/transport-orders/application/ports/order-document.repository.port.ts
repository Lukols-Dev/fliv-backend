import { TransportOrderId } from '../../domain/value-objects/transport-order-id.vo';

export const ORDER_DOCUMENT_REPOSITORY = Symbol('ORDER_DOCUMENT_REPOSITORY');

export interface AttachOrderDocumentInput {
  documentId: string;
  title?: string | null;
  source: 'DRIVER' | 'DISPATCHER' | 'SYSTEM';
}

export interface OrderDocumentRepositoryPort {
  attachToTransportOrder(
    orderId: TransportOrderId,
    input: AttachOrderDocumentInput,
  ): Promise<void>;

  detachFromTransportOrder(orderDocumentId: string): Promise<void>;
}
