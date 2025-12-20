import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTransportOrderDto {
  @IsString()
  @IsNotEmpty()
  ztNumber!: string;

  @IsOptional()
  @IsString()
  pwNumber?: string | null;

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

  @IsString()
  @IsNotEmpty()
  toCountry!: string;

  @IsOptional()
  @IsNumber()
  cargoWeightKg?: number | null;

  @IsOptional()
  @IsDateString()
  loadingDate?: string | null;

  @IsOptional()
  @IsString()
  cargoDescription?: string | null;

  @IsBoolean()
  temperatureSensitive!: boolean;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
