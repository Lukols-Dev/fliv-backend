import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsBooleanString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum PartnerPoiType {
  FUEL = 'FUEL',
  PARKING = 'PARKING',
  SERVICE = 'SERVICE',
  OTHER = 'OTHER',
}

export class ListPartnerPoisQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  north?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(-90)
  @Max(90)
  south?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  east?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(-180)
  @Max(180)
  west?: number;

  @IsOptional()
  @IsBooleanString()
  isActive?: string;
}

export class CreatePartnerPoiDto {
  @IsOptional()
  @IsString()
  name?: string | null;

  @IsOptional()
  @IsEnum(PartnerPoiType)
  type?: PartnerPoiType;

  @IsString()
  address!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePartnerPoiDto {
  @IsOptional()
  @IsString()
  name?: string | null;

  @IsOptional()
  @IsEnum(PartnerPoiType)
  type?: PartnerPoiType;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
