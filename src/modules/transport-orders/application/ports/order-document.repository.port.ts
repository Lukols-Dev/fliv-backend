import { TransportOrderId } from '../../domain/value-objects/transport-order-id.vo';

export const ORDER_DOCUMENT_REPOSITORY = Symbol('ORDER_DOCUMENT_REPOSITORY');

export interface AttachOrderDocumentInput {
  title?: string | null;
  source: 'DRIVER' | 'DISPATCHER' | 'SYSTEM';
  url: string;
  storageKey: string;
  mimeType: string;
  sizeBytes?: number | null;
  originalFilename?: string | null;
  description?: string | null;
  uploadedByUserId?: string | null;
}

export interface AttachedOrderDocumentResult {
  orderDocumentId: string;
  createdAt: Date;
  title: string | null;
  url: string;
  mimeType: string;
  sizeBytes: number | null;
  originalFilename: string | null;
  description: string | null;
}

export interface OrderDocumentRepositoryPort {
  attachToTransportOrder(
    orderId: TransportOrderId,
    input: AttachOrderDocumentInput,
  ): Promise<AttachedOrderDocumentResult>;

  findStorageKeyByOrderDocumentId(
    orderDocumentId: string,
  ): Promise<string | null>;

  deleteOrderDocument(orderDocumentId: string): Promise<void>;
}
