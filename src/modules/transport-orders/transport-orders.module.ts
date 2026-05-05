import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { DocumentsModule } from '../documents/documents.module';
import { TRANSPORT_ORDER_REPOSITORY } from './application/ports/transport-order.repository.port';
import { ORDER_DOCUMENT_REPOSITORY } from './application/ports/order-document.repository.port';
import { TRANSPORT_ORDER_EVENT_REPOSITORY } from './application/ports/transport-order-event.repository.port';
import { GEOCODING_SERVICE } from './application/ports/geocoding.port';

import { TransportOrdersPrismaRepository } from './infrastructure/presistence/transport-orders.prisma-repository';
import { OrderDocumentsPrismaRepository } from './infrastructure/presistence/order-documents.prisma-repository';
import { TransportOrderEventPrismaRepository } from './infrastructure/presistence/transport-order-event.prisma-repository';
import { HereGeocodingService } from './infrastructure/geocoding/here-geocoding.service';
import { RoutePointGeocodingService } from './application/services/route-point-geocoding.service';
import { TransportOrderRouteEditorService } from './application/services/transport-order-route-editor.service';

import { CreateTransportOrderUseCase } from './application/use-cases/create-transport-order.usecase';
import { UpdateTransportOrderUseCase } from './application/use-cases/update-transport-order.usecase';
import { DeleteTransportOrderUseCase } from './application/use-cases/delete-transport-order.usecase';
import { DetachDocumentFromTransportOrderUseCase } from './application/use-cases/detach-document-from-transport-order.usecase';
import { ListDispatcherTransportOrdersUseCase } from './application/use-cases/list-dispatcher-transport-orders.usecase';
import { GetDispatcherTransportOrderUseCase } from './application/use-cases/get-dispatcher-transport-order.usecase';
import { ListDriverTransportOrdersUseCase } from './application/use-cases/list-driver-transport-orders.usecase';
import { GetDriverTransportOrderUseCase } from './application/use-cases/get-driver-transport-order.usecase';
import { AssignTransportOrderToDriverUseCase } from './application/use-cases/assign-transport-order-to-driver.usecase';
import { UpdateDriverTransportOrderStatusUseCase } from './application/use-cases/update-driver-transport-order-status.usecase';
import { ReportTransportOrderEventUseCase } from './application/use-cases/report-transport-order-event.usecase';
import { ReportTransportOrderProblemUseCase } from './application/use-cases/report-transport-order-problem.usecase';
import { UploadDriverDocumentToTransportOrderUseCase } from './application/use-cases/upload-driver-document-to-transport-order.usecase';
import { UploadDispatcherDocumentToTransportOrderUseCase } from './application/use-cases/upload-dispatcher-document-to-transport-order.usecase';

import { DispatcherTransportOrdersController } from './interface/rest/dispatcher-transport-orders.controller';
import { DriverTransportOrdersController } from './interface/rest/driver-transport-orders.controller';

@Module({
  imports: [PrismaModule, NotificationsModule, DocumentsModule],
  providers: [
    {
      provide: TRANSPORT_ORDER_REPOSITORY,
      useClass: TransportOrdersPrismaRepository,
    },
    {
      provide: ORDER_DOCUMENT_REPOSITORY,
      useClass: OrderDocumentsPrismaRepository,
    },
    {
      provide: TRANSPORT_ORDER_EVENT_REPOSITORY,
      useClass: TransportOrderEventPrismaRepository,
    },
    {
      provide: GEOCODING_SERVICE,
      useClass: HereGeocodingService,
    },
    RoutePointGeocodingService,
    TransportOrderRouteEditorService,
    CreateTransportOrderUseCase,
    UpdateTransportOrderUseCase,
    DeleteTransportOrderUseCase,
    DetachDocumentFromTransportOrderUseCase,
    ListDispatcherTransportOrdersUseCase,
    GetDispatcherTransportOrderUseCase,
    ListDriverTransportOrdersUseCase,
    GetDriverTransportOrderUseCase,
    AssignTransportOrderToDriverUseCase,
    UpdateDriverTransportOrderStatusUseCase,
    ReportTransportOrderEventUseCase,
    ReportTransportOrderProblemUseCase,
    UploadDriverDocumentToTransportOrderUseCase,
    UploadDispatcherDocumentToTransportOrderUseCase,
  ],
  controllers: [
    DispatcherTransportOrdersController,
    DriverTransportOrdersController,
  ],
})
export class TransportOrdersModule {}
