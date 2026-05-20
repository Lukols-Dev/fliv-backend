import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FILE_STORAGE_PORT } from './application/ports/file-storage.port';

import { CloudinaryFileStorageAdapter } from './infrastructure/adapters/cloudinary-file-storage.adapter';

import { UploadDocumentUseCase } from './application/use-cases/upload-document.usecase';
import { DeleteDocumentUseCase } from './application/use-cases/delete-document.usecase';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: FILE_STORAGE_PORT,
      useClass: CloudinaryFileStorageAdapter,
    },
    UploadDocumentUseCase,
    DeleteDocumentUseCase,
  ],
  exports: [FILE_STORAGE_PORT, UploadDocumentUseCase, DeleteDocumentUseCase],
})
export class DocumentsModule {}
