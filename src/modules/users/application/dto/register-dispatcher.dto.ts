import { IsOptional, IsString, Length } from 'class-validator';

export class RegisterDispatcherDto {
  @IsOptional()
  @IsString()
  @Length(5, 32)
  phone?: string;
}
