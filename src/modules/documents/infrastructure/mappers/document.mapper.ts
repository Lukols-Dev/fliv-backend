import type { Document as PrismaDocument } from 'generated/prisma/client';
import { Document } from '../../domain/entities/document.entity';
import { DocumentId } from '../../domain/value-objects/document-id.vo';

export class DocumentMapper {
  static toDomain(record: PrismaDocument): Document {
    return new Document(
      new DocumentId(record.id),
      record.url,
      record.storageKey,
      record.mimeType,
      record.sizeBytes ?? null,
      record.originalFilename ?? null,
      record.description ?? null,
      record.uploadedByUserId ?? null,
      record.createdAt,
    );
  }
}
