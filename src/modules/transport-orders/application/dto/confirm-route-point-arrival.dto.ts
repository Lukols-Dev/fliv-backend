import { IsDateString, IsInt, IsNumber } from 'class-validator';

export class ConfirmRoutePointArrivalDto {
  @IsInt()
  sequence!: number;

  @IsDateString()
  confirmedAt!: string;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;
}
