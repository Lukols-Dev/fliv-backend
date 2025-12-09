import { Inject, Injectable } from '@nestjs/common';
import { UploadDocumentDto } from '../dto/upload-document.dto';
import {
  FILE_STORAGE_PORT,
  type FileStoragePort,
  type LocalFile,
} from '../ports/file-storage.port';
import {
  DOCUMENT_REPOSITORY,
  type DocumentRepositoryPort,
} from '../ports/document.repository.port';
import { Document } from '../../domain/entities/document.entity';

export interface UploadDocumentInput {
  currentUserId: string;
  file: LocalFile;
  payload: UploadDocumentDto;
}

@Injectable()
export class UploadDocumentUseCase {
  constructor(
    @Inject(FILE_STORAGE_PORT)
    private readonly fileStorage: FileStoragePort,
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: DocumentRepositoryPort,
  ) {}

  async execute(input: UploadDocumentInput): Promise<Document> {
    const uploaded = await this.fileStorage.uploadFile({
      localFile: input.file,
    });

    const created = await this.documentRepository.create({
      url: uploaded.url,
      storageKey: uploaded.storageKey,
      mimeType: uploaded.mimeType,
      sizeBytes: uploaded.sizeBytes,
      originalFilename: uploaded.originalFilename,
      description: input.payload.description ?? null,
      uploadedByUserId: input.currentUserId,
    });

    return created;
  }
}
