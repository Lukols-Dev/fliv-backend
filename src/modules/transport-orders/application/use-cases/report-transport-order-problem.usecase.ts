import { BadRequestException, Injectable } from '@nestjs/common';
import { TransportOrderStatus } from '../../domain/value-objects/transport-order-status.vo';
import { UpdateDriverTransportOrderStatusUseCase } from './update-driver-transport-order-status.usecase';
import { TransportOrderEventType } from '../../domain/value-objects/transport-order-event-type.vo';
import { TransportOrder } from '../../domain/entities/transport-order.entity';

export interface ReportTransportOrderProblemInput {
  currentUserId: string;
  orderId: string;
  description: string;
}

@Injectable()
export class ReportTransportOrderProblemUseCase {
  constructor(
    private readonly updateStatusUseCase: UpdateDriverTransportOrderStatusUseCase,
  ) {}

  async execute(
    input: ReportTransportOrderProblemInput,
  ): Promise<TransportOrder> {
    if (!input.description?.trim()) {
      throw new BadRequestException('Problem description is required');
    }

    return this.updateStatusUseCase.execute({
      currentUserId: input.currentUserId,
      orderId: input.orderId,
      status: TransportOrderStatus.PROBLEM,
      description: input.description,
      actionOverride: TransportOrderEventType.PROBLEM_REPORTED,
    });
  }
}
