import { Inject, Injectable } from '@nestjs/common';
import { CreateTransportOrderDto } from '../dto/create-transport-order.dto';
import {
  TRANSPORT_ORDER_REPOSITORY,
  type TransportOrderRepositoryPort,
} from '../ports/transport-order.repository.port';
import { TransportOrder } from '../../domain/entities/transport-order.entity';

export interface CreateTransportOrderInput {
  currentUserId: string;
  payload: CreateTransportOrderDto;
}

@Injectable()
export class CreateTransportOrderUseCase {
  constructor(
    @Inject(TRANSPORT_ORDER_REPOSITORY)
    private readonly transportOrderRepository: TransportOrderRepositoryPort,
  ) {}

  async execute(input: CreateTransportOrderInput): Promise<TransportOrder> {
    const { payload, currentUserId } = input;

    const created = await this.transportOrderRepository.create({
      ztNumber: payload.ztNumber,
      pwNumber: payload.pwNumber ?? null,
      timelinessStatus: payload.timelinessStatus ?? null,
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
      fromAddress: payload.fromAddress ?? null,
      toCountry: payload.toCountry,
      toAddress: payload.toAddress ?? null,
      cargoWeightKg: payload.cargoWeightKg ?? null,
      loadingDate: payload.loadingDate ? new Date(payload.loadingDate) : null,
      loadingTime: payload.loadingTime ?? null,
      cargoDescription: payload.cargoDescription ?? null,
      temperatureSensitive: payload.temperatureSensitive,
      notes: payload.notes ?? null,
      createdByUserId: currentUserId,
    });

    return created;
  }
}
