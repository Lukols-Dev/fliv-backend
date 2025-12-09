import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';
import {
  type CreateDocumentInput,
  type DocumentRepositoryPort,
} from '../../application/ports/document.repository.port';
import { Document } from '../../domain/entities/document.entity';
import { DocumentId } from '../../domain/value-objects/document-id.vo';
import { DocumentMapper } from '../mappers/document.mapper';

@Injectable()
export class DocumentsPrismaRepository implements DocumentRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateDocumentInput): Promise<Document> {
    const created = await this.prisma.document.create({
      data: {
        url: input.url,
        storageKey: input.storageKey,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes ?? null,
        originalFilename: input.originalFilename ?? null,
        description: input.description ?? null,
        uploadedByUserId: input.uploadedByUserId ?? null,
      },
    });

    return DocumentMapper.toDomain(created);
  }

  async findById(id: DocumentId): Promise<Document | null> {
    const record = await this.prisma.document.findUnique({
      where: { id: id.value },
    });

    if (!record) {
      return null;
    }

    return DocumentMapper.toDomain(record);
  }

  async delete(id: DocumentId): Promise<void> {
    await this.prisma.document.delete({
      where: { id: id.value },
    });
  }
}
