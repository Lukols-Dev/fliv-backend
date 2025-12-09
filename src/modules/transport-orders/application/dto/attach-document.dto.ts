import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class AttachDocumentDto {
  @IsString()
  @IsNotEmpty()
  documentId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;
}
