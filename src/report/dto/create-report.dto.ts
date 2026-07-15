import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  subject?: string;

  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsString()
  @IsOptional()
  priority?: string;
}