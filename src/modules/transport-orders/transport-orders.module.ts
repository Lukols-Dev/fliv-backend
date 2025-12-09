import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { TRANSPORT_ORDER_REPOSITORY } from './application/ports/transport-order.repository.port';
import { ORDER_DOCUMENT_REPOSITORY } from './application/ports/order-document.repository.port';

import { TransportOrdersPrismaRepository } from './infrastructure/presistence/transport-orders.prisma-repository';
import { OrderDocumentsPrismaRepository } from './infrastructure/presistence/order-documents.prisma-repository';

import { CreateTransportOrderUseCase } from './application/use-cases/create-transport-order.usecase';
import { UpdateTransportOrderUseCase } from './application/use-cases/update-transport-order.usecase';
import { DeleteTransportOrderUseCase } from './application/use-cases/delete-transport-order.usecase';
import { AttachDocumentToTransportOrderUseCase } from './application/use-cases/attach-document-to-transport-order.usecase';
import { DetachDocumentFromTransportOrderUseCase } from './application/use-cases/detach-document-from-transport-order.usecase';
import { ListDispatcherTransportOrdersUseCase } from './application/use-cases/list-dispatcher-transport-orders.usecase';
import { GetDispatcherTransportOrderUseCase } from './application/use-cases/get-dispatcher-transport-order.usecase';
import { ListDriverTransportOrdersUseCase } from './application/use-cases/list-driver-transport-orders.usecase';
import { GetDriverTransportOrderUseCase } from './application/use-cases/get-driver-transport-order.usecase';
import { AssignTransportOrderToDriverUseCase } from './application/use-cases/assign-transport-order-to-driver.usecase';

import { DispatcherTransportOrdersController } from './interface/rest/dispatcher-transport-orders.controller';
import { DriverTransportOrdersController } from './interface/rest/driver-transport-orders.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: TRANSPORT_ORDER_REPOSITORY,
      useClass: TransportOrdersPrismaRepository,
    },
    {
      provide: ORDER_DOCUMENT_REPOSITORY,
      useClass: OrderDocumentsPrismaRepository,
    },
    CreateTransportOrderUseCase,
    UpdateTransportOrderUseCase,
    DeleteTransportOrderUseCase,
    AttachDocumentToTransportOrderUseCase,
    DetachDocumentFromTransportOrderUseCase,
    ListDispatcherTransportOrdersUseCase,
    GetDispatcherTransportOrderUseCase,
    ListDriverTransportOrdersUseCase,
    GetDriverTransportOrderUseCase,
    AssignTransportOrderToDriverUseCase,
  ],
  controllers: [
    DispatcherTransportOrdersController,
    DriverTransportOrdersController,
  ],
})
export class TransportOrdersModule {}
