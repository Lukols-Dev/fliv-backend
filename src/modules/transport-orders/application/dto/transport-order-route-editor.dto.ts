import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransportOrderRoutePointBehavior } from '../../domain/value-objects/transport-order-route-point-behavior.vo';
import { TransportOrderRoutePointSource } from '../../domain/value-objects/transport-order-route-point-source.vo';
import { TransportOrderRoutePointType } from '../../domain/value-objects/transport-order-route-point-type.vo';

export const HAZARDOUS_GOODS = [
  'explosive',
  'gas',
  'flammable',
  'combustible',
  'organic',
  'poison',
  'radioactive',
  'corrosive',
  'poisonousInhalation',
  'harmfulToWater',
  'other',
] as const;

export class RoutePointDraftDto {
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  sequence!: number;

  @IsEnum(TransportOrderRoutePointType)
  type!: TransportOrderRoutePointType;

  @IsEnum(TransportOrderRoutePointBehavior)
  behavior!: TransportOrderRoutePointBehavior;

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
  latitude!: number;

  @IsNumber()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  longitude!: number;
}

export class RoutingProfileDto {
  @IsOptional()
  @IsIn(['here', 'manual'])
  mode?: 'here' | 'manual';

  @IsIn(['car', 'truck'])
  transportMode!: 'car' | 'truck';

  @IsIn(['fast', 'short'])
  routingMode!: 'fast' | 'short';

  @IsIn(['default', 'disabled'])
  trafficMode!: 'default' | 'disabled';

  @IsBoolean()
  avoidTolls!: boolean;

  @IsBoolean()
  avoidFerries!: boolean;

  @IsBoolean()
  avoidMotorways!: boolean;
}

export class VehicleSpecDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  heightCm?: number | null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  widthCm?: number | null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  lengthCm?: number | null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  currentWeightKg?: number | null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  grossWeightKg?: number | null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  weightPerAxleKg?: number | null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  axleCount?: number | null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  trailerCount?: number | null;

  @IsOptional()
  @IsArray()
  @IsIn(HAZARDOUS_GOODS, { each: true })
  hazardousGoods?: string[] | null;
}

export class CalculateTransportOrderRouteDto {
  @IsArray()
  @ArrayUnique((point: RoutePointDraftDto) => point.sequence)
  @ValidateNested({ each: true })
  @Type(() => RoutePointDraftDto)
  routePoints!: RoutePointDraftDto[];

  @ValidateNested()
  @Type(() => RoutingProfileDto)
  routingProfile!: RoutingProfileDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VehicleSpecDto)
  vehicleSpec?: VehicleSpecDto | null;
}

export class SaveTransportOrderRouteDto extends CalculateTransportOrderRouteDto {
  @IsString()
  routePreviewId!: string;

  @IsString()
  calculationHash!: string;
}
