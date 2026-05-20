import {
  IsBoolean,
  IsArray,
  ArrayUnique,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransportOrderRoutePointDto } from './transport-order-route-point.dto';

export class CreateTransportOrderDto {
  @IsString()
  @IsNotEmpty()
  ztNumber!: string;

  @IsOptional()
  @IsString()
  pwNumber?: string | null;

  @IsOptional()
  @IsString()
  timelinessStatus!: string;

  @IsString()
  @IsNotEmpty()
  vehiclePlate!: string;

  @IsOptional()
  @IsString()
  trailerPlate?: string | null;

  @IsString()
  @IsNotEmpty()
  driverFirstName!: string;

  @IsString()
  @IsNotEmpty()
  driverLastName!: string;

  @IsString()
  @IsNotEmpty()
  driverPhone!: string;

  @IsString()
  @IsNotEmpty()
  clientName!: string;

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

  @IsString()
  @IsNotEmpty()
  fromCountry!: string;

  @IsOptional()
  @IsString()
  fromAddress?: string | null;

  @IsString()
  @IsNotEmpty()
  toCountry!: string;

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

  @IsBoolean()
  temperatureSensitive!: boolean;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayUnique((point: TransportOrderRoutePointDto) => point.sequence)
  @ValidateNested({ each: true })
  @Type(() => TransportOrderRoutePointDto)
  routePoints?: TransportOrderRoutePointDto[];
}
