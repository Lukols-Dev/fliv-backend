import { Inject, Injectable } from '@nestjs/common';
import {
  FILE_STORAGE_PORT,
  type FileStoragePort,
  type LocalFile,
  type UploadedFileInfo,
} from '../ports/file-storage.port';

export interface UploadDocumentInput {
  file: LocalFile;
  folder?: string;
}

@Injectable()
export class UploadDocumentUseCase {
  constructor(
    @Inject(FILE_STORAGE_PORT)
    private readonly fileStorage: FileStoragePort,
  ) {}

  async execute(input: UploadDocumentInput): Promise<UploadedFileInfo> {
    return await this.fileStorage.uploadFile({
      localFile: input.file,
      folder: input.folder,
    });
  }
}
