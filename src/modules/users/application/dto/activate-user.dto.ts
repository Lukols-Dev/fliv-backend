import { IsBoolean, IsString } from 'class-validator';

export class ActivateUserDto {
  @IsString()
  userId!: string;

  @IsBoolean()
  isActive!: boolean;
}
