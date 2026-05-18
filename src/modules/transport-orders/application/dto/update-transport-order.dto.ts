import {
  IsBoolean,
  IsArray,
  ArrayUnique,
  IsDateString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransportOrderStatus } from '../../domain/value-objects/transport-order-status.vo';
import { TransportOrderRoutePointDto } from './transport-order-route-point.dto';

export class UpdateTransportOrderDto {
  @IsOptional()
  @IsString()
  ztNumber?: string;

  @IsOptional()
  @IsString()
  pwNumber?: string | null;

  @IsOptional()
  @IsString()
  vehiclePlate?: string;

  @IsOptional()
  @IsString()
  trailerPlate?: string | null;

  @IsOptional()
  @IsString()
  driverFirstName?: string;

  @IsOptional()
  @IsString()
  driverLastName?: string;

  @IsOptional()
  @IsString()
  driverPhone?: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsString()
  contractNumber?: string | null;

  @IsOptional()
  @IsString()
  payerName?: string | null;

  @IsOptional()
  @IsString()
  payerVatId?: string | null;

  @IsOptional()
  @IsEmail()
  payerEmail?: string | null;

  @IsOptional()
  @IsString()
  fromCountry?: string;

  @IsOptional()
  @IsString()
  fromAddress?: string | null;

  @IsOptional()
  @IsString()
  toCountry?: string;

  @IsOptional()
  @IsString()
  toAddress?: string | null;

  @IsOptional()
  @IsNumber()
  cargoWeightKg?: number | null;

  @IsOptional()
  @IsDateString()
  loadingDate?: string | null;

  @IsOptional()
  @IsString()
  loadingTime?: string | null;

  @IsOptional()
  @IsString()
  cargoDescription?: string | null;

  @IsOptional()
  @IsBoolean()
  temperatureSensitive?: boolean;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  status?: TransportOrderStatus;

  @IsOptional()
  @IsArray()
  @ArrayUnique((point: TransportOrderRoutePointDto) => point.sequence)
  @ValidateNested({ each: true })
  @Type(() => TransportOrderRoutePointDto)
  routePoints?: TransportOrderRoutePointDto[];
}
