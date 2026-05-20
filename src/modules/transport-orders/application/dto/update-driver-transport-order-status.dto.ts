import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TransportOrderStatus } from '../../domain/value-objects/transport-order-status.vo';

export class UpdateDriverTransportOrderStatusDto {
  @IsEnum(TransportOrderStatus)
  status!: TransportOrderStatus;

  @IsOptional()
  @IsString()
  description?: string | null;
}
