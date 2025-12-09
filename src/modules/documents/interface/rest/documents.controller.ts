import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { routesV1 } from 'src/config/app.routes';
import { UploadDocumentDto } from '../../application/dto/upload-document.dto';
import { UploadDocumentUseCase } from '../../application/use-cases/upload-document.usecase';
import { DeleteDocumentUseCase } from '../../application/use-cases/delete-document.usecase';
import type { LocalFile } from '../../application/ports/file-storage.port';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

@ApiTags('Documents')
@ApiBearerAuth()
@Controller(routesV1.documents.root)
@UseGuards(AuthGuard)
export class DocumentsController {
  constructor(
    private readonly uploadDocumentUseCase: UploadDocumentUseCase,
    private readonly deleteDocumentUseCase: DeleteDocumentUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Upload document (Cloudinary)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        description: {
          type: 'string',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
    }),
  )
  async upload(
    @Session() session: UserSession,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpe?g|png|webp)$/i })
        .addMaxSizeValidator({ maxSize: MAX_FILE_SIZE_BYTES })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Body() body: UploadDocumentDto,
  ): Promise<{
    id: string;
    url: string;
    mimeType: string;
    sizeBytes: number | null;
    originalFilename: string | null;
    description: string | null;
  }> {
    if (!file?.buffer) {
      throw new BadRequestException('File buffer is missing');
    }

    const localFile: LocalFile = {
      buffer: file.buffer,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      originalFilename: file.originalname,
    };

    const document = await this.uploadDocumentUseCase.execute({
      currentUserId: session.user.id,
      file: localFile,
      payload: body,
    });

    return {
      id: document.id.value,
      url: document.url,
      mimeType: document.mimeType,
      sizeBytes: document.sizeBytes,
      originalFilename: document.originalFilename,
      description: document.description,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document (Cloudinary + DB)' })
  async delete(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.deleteDocumentUseCase.execute({ documentId: id });
    return { success: true };
  }
}
