import { Inject, Injectable } from '@nestjs/common';
import { UpdateTransportOrderDto } from '../dto/update-transport-order.dto';
import {
  TRANSPORT_ORDER_REPOSITORY,
  type TransportOrderRepositoryPort,
} from '../ports/transport-order.repository.port';
import { TransportOrderId } from '../../domain/value-objects/transport-order-id.vo';
import { TransportOrder } from '../../domain/entities/transport-order.entity';

export interface UpdateTransportOrderInput {
  orderId: string;
  payload: UpdateTransportOrderDto;
}

@Injectable()
export class UpdateTransportOrderUseCase {
  constructor(
    @Inject(TRANSPORT_ORDER_REPOSITORY)
    private readonly transportOrderRepository: TransportOrderRepositoryPort,
  ) {}

  async execute(input: UpdateTransportOrderInput): Promise<TransportOrder> {
    const orderId = new TransportOrderId(input.orderId);

    const existing = await this.transportOrderRepository.findById(orderId);
    if (!existing) {
      throw new Error('Transport order does not exist');
    }

    const loadingDate =
      input.payload.loadingDate != null
        ? new Date(input.payload.loadingDate)
        : undefined;

    return this.transportOrderRepository.update(orderId, {
      ztNumber: input.payload.ztNumber,
      pwNumber: input.payload.pwNumber,
      vehiclePlate: input.payload.vehiclePlate,
      trailerPlate: input.payload.trailerPlate,
      driverFirstName: input.payload.driverFirstName,
      driverLastName: input.payload.driverLastName,
      driverPhone: input.payload.driverPhone,
      clientName: input.payload.clientName,
      contractNumber: input.payload.contractNumber,
      payerName: input.payload.payerName,
      payerVatId: input.payload.payerVatId,
      payerEmail: input.payload.payerEmail,
      fromCountry: input.payload.fromCountry,
      toCountry: input.payload.toCountry,
      cargoWeightKg: input.payload.cargoWeightKg,
      loadingDate,
      cargoDescription: input.payload.cargoDescription,
      temperatureSensitive: input.payload.temperatureSensitive,
      notes: input.payload.notes,
      status: input.payload.status,
    });
  }
}
