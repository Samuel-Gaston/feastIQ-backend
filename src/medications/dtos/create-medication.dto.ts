import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsMongoId } from "class-validator";

export class CreateMedicationDTO {
  @ApiProperty({ description: 'The prescription this medication belongs to' })
  @IsNotEmpty()
  @IsMongoId()
  prescription?: string;

  @ApiProperty({ description: 'The name of the medication e.g. Amoxicillin' })
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ description: 'Dosage e.g. 500mg' })
  @IsOptional()
  @IsString()
  dosage?: string;

  @ApiPropertyOptional({ description: 'Frequency e.g. twice daily' })
  @IsOptional()
  @IsString()
  frequency?: string;

  @ApiPropertyOptional({ description: 'Schedule e.g. morning and night' })
  @IsOptional()
  @IsString()
  schedule?: string;

  @ApiPropertyOptional({ description: 'Duration e.g. 7 days' })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({ description: 'Usage instructions' })
  @IsOptional()
  @IsString()
  instruction?: string;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'End date' })
  @IsOptional()
  @IsDateString()
  endDate?: Date;
}

export class UpdateMedicationDTO {
  @ApiPropertyOptional({ description: 'Updated medication name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Updated dosage' })
  @IsOptional()
  @IsString()
  dosage?: string;

  @ApiPropertyOptional({ description: 'Updated frequency' })
  @IsOptional()
  @IsString()
  frequency?: string;

  @ApiPropertyOptional({ description: 'Updated schedule' })
  @IsOptional()
  @IsString()
  schedule?: string;

  @ApiPropertyOptional({ description: 'Updated duration' })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({ description: 'Updated instructions' })
  @IsOptional()
  @IsString()
  instruction?: string;

  @ApiPropertyOptional({ description: 'Updated start date' })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'Updated end date' })
  @IsOptional()
  @IsDateString()
  endDate?: Date;
}