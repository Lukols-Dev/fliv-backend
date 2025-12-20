import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
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
import { CreateTransportOrderDto } from '../../application/dto/create-transport-order.dto';
import { UpdateTransportOrderDto } from '../../application/dto/update-transport-order.dto';
import { CreateTransportOrderUseCase } from '../../application/use-cases/create-transport-order.usecase';
import { UpdateTransportOrderUseCase } from '../../application/use-cases/update-transport-order.usecase';
import { DeleteTransportOrderUseCase } from '../../application/use-cases/delete-transport-order.usecase';
import { DetachDocumentFromTransportOrderUseCase } from '../../application/use-cases/detach-document-from-transport-order.usecase';
import { routesV1 } from 'src/config/app.routes';
import { ListDispatcherTransportOrdersUseCase } from '../../application/use-cases/list-dispatcher-transport-orders.usecase';
import { GetDispatcherTransportOrderUseCase } from '../../application/use-cases/get-dispatcher-transport-order.usecase';
import { Roles } from 'src/modules/auth/interface/http/roles.decorator';
import { ROLE_DISPATCHER } from 'src/shared/constants/roles.constants';
import { UploadDispatcherDocumentToTransportOrderUseCase } from '../../application/use-cases/upload-dispatcher-document-to-transport-order.usecase';
import { UploadDriverOrderDocumentDto } from '../../application/dto/upload-driver-order-document.dto';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

@ApiTags('TransportOrders - Dispatcher')
@ApiBearerAuth()
@Controller(routesV1.transportOrders.dispatcher.root)
@Roles(ROLE_DISPATCHER)
export class DispatcherTransportOrdersController {
  constructor(
    private readonly createTransportOrderUseCase: CreateTransportOrderUseCase,
    private readonly updateTransportOrderUseCase: UpdateTransportOrderUseCase,
    private readonly deleteTransportOrderUseCase: DeleteTransportOrderUseCase,
    private readonly detachDocumentUseCase: DetachDocumentFromTransportOrderUseCase,
    private readonly listDispatcherOrdersUseCase: ListDispatcherTransportOrdersUseCase,
    private readonly getDispatcherOrderUseCase: GetDispatcherTransportOrderUseCase,
    private readonly uploadDispatcherDocumentUseCase: UploadDispatcherDocumentToTransportOrderUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new transport order (ZT)' })
  async create(
    @Session() session: UserSession,
    @Body() dto: CreateTransportOrderDto,
  ) {
    const order = await this.createTransportOrderUseCase.execute({
      currentUserId: session.user.id,
      payload: dto,
    });

    return {
      id: order.id.value,
      ztNumber: order.ztNumber,
      status: order.status,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update existing transport order' })
  async update(@Param('id') id: string, @Body() dto: UpdateTransportOrderDto) {
    const order = await this.updateTransportOrderUseCase.execute({
      orderId: id,
      payload: dto,
    });

    return {
      id: order.id.value,
      ztNumber: order.ztNumber,
      status: order.status,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete existing transport order' })
  async delete(@Param('id') id: string) {
    await this.deleteTransportOrderUseCase.execute({ orderId: id });
    return { success: true };
  }

  @Post(':id/documents')
  @ApiOperation({
    summary:
      'Upload and attach document to transport order (dispatcher, single step)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        title: { type: 'string', maxLength: 255 },
      },
      required: ['file', 'title'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
    }),
  )
  async uploadDocument(
    @Session() session: UserSession,
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpe?g|png|webp)$/i })
        .addMaxSizeValidator({ maxSize: MAX_FILE_SIZE_BYTES })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Body() body: UploadDriverOrderDocumentDto,
  ) {
    const document = await this.uploadDispatcherDocumentUseCase.execute({
      currentUserId: session.user.id,
      orderId: id,
      file: {
        buffer: file.buffer,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        originalFilename: file.originalname,
      },
      payload: body,
    });

    return {
      id: document.id.value,
      url: document.url,
      mimeType: document.mimeType,
      sizeBytes: document.sizeBytes,
      originalFilename: document.originalFilename,
      description: document.description,
      title: body.title,
    };
  }

  @Delete('documents/:orderDocumentId')
  @ApiOperation({ summary: 'Detach document from transport order' })
  async detachDocument(@Param('orderDocumentId') orderDocumentId: string) {
    await this.detachDocumentUseCase.execute({ orderDocumentId });
    return { success: true };
  }

  @Get()
  @ApiOperation({ summary: 'List transport orders (dispatcher)' })
  async list(
    @Session() session: UserSession,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? Number(page) : undefined;
    const limitNumber = limit ? Number(limit) : undefined;

    const orders = await this.listDispatcherOrdersUseCase.execute({
      currentUserId: session.user.id,
      status,
      page:
        pageNumber && Number.isFinite(pageNumber) && pageNumber > 0
          ? pageNumber
          : undefined,
      limit:
        limitNumber && Number.isFinite(limitNumber) && limitNumber > 0
          ? limitNumber
          : undefined,
    });

    return orders.map((order) => ({
      id: order.id.value,
      ztNumber: order.ztNumber,
      status: order.status,
      vehiclePlate: order.vehiclePlate,
      trailerPlate: order.trailerPlate,
      driverName:
        `${order.driverFirstName ?? ''} ${order.driverLastName ?? ''}`.trim(),
      loadingDate: order.loadingDate,
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transport order details (dispatcher)' })
  async getOne(@Param('id') id: string) {
    const order = await this.getDispatcherOrderUseCase.execute({ orderId: id });

    return {
      id: order.id.value,
      ztNumber: order.ztNumber,
      pwNumber: order.pwNumber,
      status: order.status,
      vehiclePlate: order.vehiclePlate,
      trailerPlate: order.trailerPlate,
      driverFirstName: order.driverFirstName,
      driverLastName: order.driverLastName,
      driverPhone: order.driverPhone,
      clientName: order.clientName,
      contractNumber: order.contractNumber,
      payerName: order.payerName,
      payerVatId: order.payerVatId,
      payerEmail: order.payerEmail,
      fromCountry: order.fromCountry,
      toCountry: order.toCountry,
      cargoWeightKg: order.cargoWeightKg,
      loadingDate: order.loadingDate,
      cargoDescription: order.cargoDescription,
      temperatureSensitive: order.temperatureSensitive,
      notes: order.notes,
      documents: order.documents.map((doc) => ({
        id: doc.id.value,
        title: doc.title ?? null,
        createdAt: doc.createdAt,
        url: doc.url,
        mimeType: doc.mimeType,
        sizeBytes: doc.sizeBytes,
        originalFilename: doc.originalFilename,
        description: doc.description ?? null,
      })),
      events: order.events.map((event) => ({
        id: event.id.value,
        type: event.type,
        previousStatus: event.previousStatus,
        newStatus: event.newStatus,
        description: event.description,
        createdAt: event.createdAt,
      })),
    };
  }
}
