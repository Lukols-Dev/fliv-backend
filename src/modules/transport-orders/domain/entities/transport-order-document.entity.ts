import { TransportOrderDocumentId } from '../value-objects/transport-order-document-id.vo';

export class TransportOrderDocument {
  constructor(
    public readonly id: TransportOrderDocumentId,
    public readonly title: string | null,
    public readonly createdAt: Date,
    public readonly url: string,
    public readonly mimeType: string,
    public readonly sizeBytes: number | null,
    public readonly originalFilename: string | null,
    public readonly description: string | null,
  ) {}
}
