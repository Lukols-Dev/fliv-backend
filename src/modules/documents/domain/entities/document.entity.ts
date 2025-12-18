import { DocumentId } from '../value-objects/document-id.vo';

export class Document {
  constructor(
    public readonly id: DocumentId,
    public url: string,
    public storageKey: string,
    public mimeType: string,
    public sizeBytes: number | null,
    public originalFilename: string | null,
    public description: string | null,
    public uploadedByUserId: string | null,
    public createdAt: Date,
  ) {}
}
