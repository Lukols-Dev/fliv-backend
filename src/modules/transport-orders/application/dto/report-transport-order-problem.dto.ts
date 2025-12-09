import { IsNotEmpty, IsString } from 'class-validator';

export class ReportTransportOrderProblemDto {
  @IsString()
  @IsNotEmpty()
  description!: string;
}
