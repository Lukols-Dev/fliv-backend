import {
  Body,
  Controller,
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

import { routesV1 } from 'src/config/app.routes';
import { ListDriverTransportOrdersUseCase } from '../../application/use-cases/list-driver-transport-orders.usecase';
import { GetDriverTransportOrderUseCase } from '../../application/use-cases/get-driver-transport-order.usecase';
import { AssignTransportOrderToDriverUseCase } from '../../application/use-cases/assign-transport-order-to-driver.usecase';
import { AssignTransportOrderDto } from '../../application/dto/assign-transport-order.dto';
import { UpdateDriverTransportOrderStatusUseCase } from '../../application/use-cases/update-driver-transport-order-status.usecase';
import { UpdateDriverTransportOrderStatusDto } from '../../application/dto/update-driver-transport-order-status.dto';
import { ReportTransportOrderEventUseCase } from '../../application/use-cases/report-transport-order-event.usecase';
import { ReportTransportOrderEventDto } from '../../application/dto/report-transport-order-event.dto';
import { ReportTransportOrderProblemUseCase } from '../../application/use-cases/report-transport-order-problem.usecase';
import { ReportTransportOrderProblemDto } from '../../application/dto/report-transport-order-problem.dto';
import { Roles } from 'src/modules/auth/interface/http/roles.decorator';
import { ROLE_DRIVER } from 'src/shared/constants/roles.constants';
import { UploadDriverDocumentToTransportOrderUseCase } from '../../application/use-cases/upload-driver-document-to-transport-order.usecase';
import { UploadDriverOrderDocumentDto } from '../../application/dto/upload-driver-order-document.dto';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

@ApiTags('TransportOrders - Driver')
@ApiBearerAuth()
@Controller(routesV1.transportOrders.driver.root)
@Roles(ROLE_DRIVER)
export class DriverTransportOrdersController {
  constructor(
    private readonly listDriverOrdersUseCase: ListDriverTransportOrdersUseCase,
    private readonly getDriverOrderUseCase: GetDriverTransportOrderUseCase,
    private readonly assignTransportOrderUseCase: AssignTransportOrderToDriverUseCase,
    private readonly updateStatusUseCase: UpdateDriverTransportOrderStatusUseCase,
    private readonly reportEventUseCase: ReportTransportOrderEventUseCase,
    private readonly reportProblemUseCase: ReportTransportOrderProblemUseCase,
    private readonly uploadDriverDocumentUseCase: UploadDriverDocumentToTransportOrderUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List transport orders assigned to current driver' })
  async list(
    @Session() session: UserSession,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? Number(page) : undefined;
    const limitNumber = limit ? Number(limit) : undefined;

    const orders = await this.listDriverOrdersUseCase.execute({
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
      fromCountry: order.fromCountry,
      toCountry: order.toCountry,
      loadingDate: order.loadingDate,
    }));
  }

  @Post('assign')
  @ApiOperation({
    summary: 'Assign transport order to current driver by ZT number',
  })
  async assign(
    @Session() session: UserSession,
    @Body() dto: AssignTransportOrderDto,
  ) {
    const order = await this.assignTransportOrderUseCase.execute({
      currentUserId: session.user.id,
      ztNumber: dto.ztNumber,
    });

    return {
      id: order.id.value,
      ztNumber: order.ztNumber,
      status: order.status,
    };
  }

  @Patch(':id/status')
  @ApiOperation({
    summary:
      'Update status for assigned transport order (IN_PROGRESS, LOADING, UNLOADING, PAUSED, COMPLETED, PROBLEM)',
  })
  async updateStatus(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Body() dto: UpdateDriverTransportOrderStatusDto,
  ) {
    const order = await this.updateStatusUseCase.execute({
      currentUserId: session.user.id,
      orderId: id,
      status: dto.status,
      description: dto.description,
    });

    return {
      id: order.id.value,
      ztNumber: order.ztNumber,
      status: order.status,
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

  @Post(':id/events')
  @ApiOperation({ summary: 'Report route event (detour, accident, delay)' })
  async reportEvent(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Body() dto: ReportTransportOrderEventDto,
  ) {
    const order = await this.reportEventUseCase.execute({
      currentUserId: session.user.id,
      orderId: id,
      eventType: dto.eventType,
      description: dto.description,
    });

    return {
      id: order.id.value,
      ztNumber: order.ztNumber,
      status: order.status,
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

  @Post(':id/problem')
  @ApiOperation({ summary: 'Report a problem and change status to PROBLEM' })
  async reportProblem(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Body() dto: ReportTransportOrderProblemDto,
  ) {
    const order = await this.reportProblemUseCase.execute({
      currentUserId: session.user.id,
      orderId: id,
      description: dto.description,
    });

    return {
      id: order.id.value,
      ztNumber: order.ztNumber,
      status: order.status,
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

  @Get(':id/documents')
  @ApiOperation({ summary: 'List documents for transport order (driver)' })
  async listDocuments(
    @Session() session: UserSession,
    @Param('id') id: string,
  ) {
    const order = await this.getDriverOrderUseCase.execute({
      currentUserId: session.user.id,
      orderId: id,
    });

    return order.documents.map((doc) => ({
      id: doc.id.value,
      url: doc.url,
      mimeType: doc.mimeType,
      sizeBytes: doc.sizeBytes,
      originalFilename: doc.originalFilename,
      description: doc.description,
    }));
  }

  @Post(':id/documents')
  @ApiOperation({
    summary:
      'Upload and attach document to assigned transport order (driver only)',
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
    const document = await this.uploadDriverDocumentUseCase.execute({
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

  @Get(':id')
  @ApiOperation({ summary: 'Get transport order details for driver' })
  async getOne(@Session() session: UserSession, @Param('id') id: string) {
    const order = await this.getDriverOrderUseCase.execute({
      currentUserId: session.user.id,
      orderId: id,
    });

    return {
      id: order.id.value,
      ztNumber: order.ztNumber,
      status: order.status,
      vehiclePlate: order.vehiclePlate,
      trailerPlate: order.trailerPlate,
      clientName: order.clientName,
      fromCountry: order.fromCountry,
      toCountry: order.toCountry,
      cargoWeightKg: order.cargoWeightKg,
      loadingDate: order.loadingDate,
      cargoDescription: order.cargoDescription,
      temperatureSensitive: order.temperatureSensitive,
      notes: order.notes,
      documents: order.documents.map((doc) => ({
        id: doc.id.value,
        url: doc.url,
        mimeType: doc.mimeType,
        sizeBytes: doc.sizeBytes,
        originalFilename: doc.originalFilename,
        description: doc.description,
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
