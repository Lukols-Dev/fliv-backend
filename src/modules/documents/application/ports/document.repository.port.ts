import { Document } from '../../domain/entities/document.entity';
import { DocumentId } from '../../domain/value-objects/document-id.vo';

export const DOCUMENT_REPOSITORY = Symbol('DOCUMENT_REPOSITORY');

export interface CreateDocumentInput {
  url: string;
  storageKey: string;
  mimeType: string;
  sizeBytes?: number;
  originalFilename?: string;
  description?: string | null;
  uploadedByUserId?: string | null;
}

export interface DocumentRepositoryPort {
  create(input: CreateDocumentInput): Promise<Document>;
  findById(id: DocumentId): Promise<Document | null>;
  delete(id: DocumentId): Promise<void>;
}
