import { IsNotEmpty, IsString } from 'class-validator';

export class AssignTransportOrderDto {
  @IsString()
  @IsNotEmpty()
  ztNumber!: string;
}
