import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTransportOrderDto } from '../../application/dto/create-transport-order.dto';
import { UpdateTransportOrderDto } from '../../application/dto/update-transport-order.dto';
import { AttachDocumentDto } from '../../application/dto/attach-document.dto';
import { CreateTransportOrderUseCase } from '../../application/use-cases/create-transport-order.usecase';
import { UpdateTransportOrderUseCase } from '../../application/use-cases/update-transport-order.usecase';
import { DeleteTransportOrderUseCase } from '../../application/use-cases/delete-transport-order.usecase';
import { AttachDocumentToTransportOrderUseCase } from '../../application/use-cases/attach-document-to-transport-order.usecase';
import { DetachDocumentFromTransportOrderUseCase } from '../../application/use-cases/detach-document-from-transport-order.usecase';
import { routesV1 } from 'src/config/app.routes';
import { ListDispatcherTransportOrdersUseCase } from '../../application/use-cases/list-dispatcher-transport-orders.usecase';
import { GetDispatcherTransportOrderUseCase } from '../../application/use-cases/get-dispatcher-transport-order.usecase';
import { Roles } from 'src/modules/auth/interface/http/roles.decorator';
import { ROLE_DISPATCHER } from 'src/shared/constants/roles.constants';

@ApiTags('TransportOrders - Dispatcher')
@ApiBearerAuth()
@Controller(routesV1.transportOrders.dispatcher.root)
@Roles(ROLE_DISPATCHER)
export class DispatcherTransportOrdersController {
  constructor(
    private readonly createTransportOrderUseCase: CreateTransportOrderUseCase,
    private readonly updateTransportOrderUseCase: UpdateTransportOrderUseCase,
    private readonly deleteTransportOrderUseCase: DeleteTransportOrderUseCase,
    private readonly attachDocumentUseCase: AttachDocumentToTransportOrderUseCase,
    private readonly detachDocumentUseCase: DetachDocumentFromTransportOrderUseCase,
    private readonly listDispatcherOrdersUseCase: ListDispatcherTransportOrdersUseCase,
    private readonly getDispatcherOrderUseCase: GetDispatcherTransportOrderUseCase,
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
    summary: 'Attach existing document to transport order (dispatcher)',
  })
  async attachDocument(
    @Param('id') id: string,
    @Body() dto: AttachDocumentDto,
  ) {
    await this.attachDocumentUseCase.execute({
      orderId: id,
      payload: dto,
      source: 'DISPATCHER',
    });

    return { success: true };
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
