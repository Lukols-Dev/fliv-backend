import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransportOrderRoutePointSource } from '../../domain/value-objects/transport-order-route-point-source.vo';
import { TransportOrderRoutePointType } from '../../domain/value-objects/transport-order-route-point-type.vo';

export class TransportOrderRoutePointDto {
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  sequence!: number;

  @IsEnum(TransportOrderRoutePointType)
  type!: TransportOrderRoutePointType;

  @IsOptional()
  @IsEnum(TransportOrderRoutePointSource)
  source?: TransportOrderRoutePointSource;

  @IsOptional()
  @IsBoolean()
  isManual?: boolean;

  @IsOptional()
  @IsString()
  label?: string | null;

  @IsOptional()
  @IsString()
  address?: string | null;

  @IsNumber()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  @IsNotEmpty()
  latitude!: number;

  @IsNumber()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  @IsNotEmpty()
  longitude!: number;
}
