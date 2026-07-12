import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsArray, IsMongoId, IsDateString } from "class-validator";

export class CreatePrescriptionDTO {
  @ApiProperty({ description: 'Enter the patient id' })
  @IsNotEmpty()
  @IsMongoId()
  patient?: string;

  @ApiProperty({ description: 'Enter the doctor id' })
  @IsNotEmpty()
  @IsMongoId()
  doctor?: string;

  @ApiPropertyOptional({ description: 'Enter appointment id' })
  @IsOptional()
  @IsMongoId()
  appointment?: string;


  @ApiPropertyOptional({ description: 'Dosage instructions or pharmacist notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Enter issued date' })
  @IsNotEmpty()
  @IsDateString()
  issuedAt?: Date;

  @ApiPropertyOptional({ description: 'Enter expires date' })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;
}

export class UpdatePrescriptionDTO {

  @ApiPropertyOptional({ description: 'Update dosage instructions or notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Update expires date' })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;
}
