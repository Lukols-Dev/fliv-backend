import { Inject, Injectable } from '@nestjs/common';
import {
  DOCUMENT_REPOSITORY,
  type DocumentRepositoryPort,
} from '../ports/document.repository.port';
import {
  FILE_STORAGE_PORT,
  type FileStoragePort,
} from '../ports/file-storage.port';
import { DocumentId } from '../../domain/value-objects/document-id.vo';

export interface DeleteDocumentInput {
  documentId: string;
}

@Injectable()
export class DeleteDocumentUseCase {
  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: DocumentRepositoryPort,
    @Inject(FILE_STORAGE_PORT)
    private readonly fileStorage: FileStoragePort,
  ) {}

  async execute(input: DeleteDocumentInput): Promise<void> {
    const id = new DocumentId(input.documentId);
    const doc = await this.documentRepository.findById(id);

    if (!doc) {
      throw new Error('Document not found');
    }

    await this.fileStorage.deleteFile(doc.storageKey);
    await this.documentRepository.delete(id);
  }
}
