import { Inject, Injectable } from '@nestjs/common';
import { CreateTransportOrderDto } from '../dto/create-transport-order.dto';
import {
  TRANSPORT_ORDER_REPOSITORY,
  type TransportOrderRepositoryPort,
} from '../ports/transport-order.repository.port';
import {
  ORDER_DOCUMENT_REPOSITORY,
  type OrderDocumentRepositoryPort,
} from '../ports/order-document.repository.port';
import { TransportOrder } from '../../domain/entities/transport-order.entity';
import { TransportOrderId } from '../../domain/value-objects/transport-order-id.vo';

export interface CreateTransportOrderInput {
  currentUserId: string;
  payload: CreateTransportOrderDto;
}

@Injectable()
export class CreateTransportOrderUseCase {
  constructor(
    @Inject(TRANSPORT_ORDER_REPOSITORY)
    private readonly transportOrderRepository: TransportOrderRepositoryPort,
    @Inject(ORDER_DOCUMENT_REPOSITORY)
    private readonly orderDocumentRepository: OrderDocumentRepositoryPort,
  ) {}

  async execute(input: CreateTransportOrderInput): Promise<TransportOrder> {
    const { payload, currentUserId } = input;

    const created = await this.transportOrderRepository.create({
      ztNumber: payload.ztNumber,
      pwNumber: payload.pwNumber ?? null,
      vehiclePlate: payload.vehiclePlate,
      trailerPlate: payload.trailerPlate ?? null,
      driverFirstName: payload.driverFirstName,
      driverLastName: payload.driverLastName,
      driverPhone: payload.driverPhone,
      clientName: payload.clientName,
      contractNumber: payload.contractNumber ?? null,
      payerName: payload.payerName ?? null,
      payerVatId: payload.payerVatId ?? null,
      payerEmail: payload.payerEmail ?? null,
      fromCountry: payload.fromCountry,
      toCountry: payload.toCountry,
      cargoWeightKg: payload.cargoWeightKg ?? null,
      loadingDate: payload.loadingDate ? new Date(payload.loadingDate) : null,
      cargoDescription: payload.cargoDescription ?? null,
      temperatureSensitive: payload.temperatureSensitive,
      notes: payload.notes ?? null,
      createdByUserId: currentUserId,
    });

    if (payload.attachments && payload.attachments.length > 0) {
      const orderId = new TransportOrderId(created.id.value);
      for (const attachment of payload.attachments) {
        await this.orderDocumentRepository.attachToTransportOrder(orderId, {
          documentId: attachment.documentId,
          title: attachment.title ?? null,
          source: 'DISPATCHER',
        });
      }
    }

    return created;
  }
}
