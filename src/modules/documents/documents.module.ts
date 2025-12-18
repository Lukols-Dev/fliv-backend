import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';

import { DOCUMENT_REPOSITORY } from './application/ports/document.repository.port';
import { FILE_STORAGE_PORT } from './application/ports/file-storage.port';

import { CloudinaryFileStorageAdapter } from './infrastructure/adapters/cloudinary-file-storage.adapter';

import { UploadDocumentUseCase } from './application/use-cases/upload-document.usecase';
import { DeleteDocumentUseCase } from './application/use-cases/delete-document.usecase';
import { DocumentsController } from './interface/rest/documents.controller';
import { DocumentsPrismaRepository } from './infrastructure/presistence/documents.prisma-repository';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [
    {
      provide: DOCUMENT_REPOSITORY,
      useClass: DocumentsPrismaRepository,
    },
    {
      provide: FILE_STORAGE_PORT,
      useClass: CloudinaryFileStorageAdapter,
    },
    UploadDocumentUseCase,
    DeleteDocumentUseCase,
  ],
  controllers: [DocumentsController],
  exports: [DOCUMENT_REPOSITORY, FILE_STORAGE_PORT, UploadDocumentUseCase],
})
export class DocumentsModule {}
