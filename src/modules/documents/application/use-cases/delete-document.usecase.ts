import { Inject, Injectable } from '@nestjs/common';
import {
  FILE_STORAGE_PORT,
  type FileStoragePort,
} from '../ports/file-storage.port';

export interface DeleteDocumentInput {
  storageKey: string;
}

@Injectable()
export class DeleteDocumentUseCase {
  constructor(
    @Inject(FILE_STORAGE_PORT)
    private readonly fileStorage: FileStoragePort,
  ) {}

  async execute(input: DeleteDocumentInput): Promise<void> {
    await this.fileStorage.deleteFile(input.storageKey);
  }
}
