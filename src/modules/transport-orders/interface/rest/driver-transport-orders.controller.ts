import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { routesV1 } from 'src/config/app.routes';
import { ListDriverTransportOrdersUseCase } from '../../application/use-cases/list-driver-transport-orders.usecase';
import { GetDriverTransportOrderUseCase } from '../../application/use-cases/get-driver-transport-order.usecase';
import { AssignTransportOrderToDriverUseCase } from '../../application/use-cases/assign-transport-order-to-driver.usecase';
import { AssignTransportOrderDto } from '../../application/dto/assign-transport-order.dto';

@ApiTags('TransportOrders - Driver')
@ApiBearerAuth()
@Controller(routesV1.transportOrders.driver.root)
@UseGuards(AuthGuard)
export class DriverTransportOrdersController {
  constructor(
    private readonly listDriverOrdersUseCase: ListDriverTransportOrdersUseCase,
    private readonly getDriverOrderUseCase: GetDriverTransportOrderUseCase,
    private readonly assignTransportOrderUseCase: AssignTransportOrderToDriverUseCase,
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
    };
  }
}
