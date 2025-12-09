import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TransportOrderEventType } from '../../domain/value-objects/transport-order-event-type.vo';

export class ReportTransportOrderEventDto {
  @IsEnum(TransportOrderEventType)
  eventType!: TransportOrderEventType;

  @IsOptional()
  @IsString()
  description?: string | null;
}
