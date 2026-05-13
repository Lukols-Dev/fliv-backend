import { Type } from 'class-transformer';
import {
  IsEnum,
  IsISO8601,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { DriverLocationSource } from 'generated/prisma/client';

export class UpsertDriverLiveLocationDto {
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  accuracyMeters?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  speedMetersPerSecond?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(360)
  bearingDegrees?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  remainingDistanceMeters?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  traveledDistanceMeters?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  remainingDurationSeconds?: number;

  @IsISO8601()
  recordedAt!: string;

  @IsEnum(DriverLocationSource)
  source!: DriverLocationSource;
}
