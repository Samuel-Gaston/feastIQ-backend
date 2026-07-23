// health-logs/dtos/create-health-log.dto.ts
import { IsOptional, IsNumber, IsEnum, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { VitalSource } from "../schemas/health-log.schema";


class BloodPressureDTO {
  @ApiPropertyOptional({ example: 118 })
  @IsNumber() systolic?: number;

  @ApiPropertyOptional({ example: 78 })
  @IsNumber() diastolic?: number;
}

export class CreateHealthLogDTO {
  @ApiPropertyOptional({ example: 72, description: 'Heart rate in bpm' })
  @IsOptional() @IsNumber() heartRate?: number;

  @ApiPropertyOptional({ type: BloodPressureDTO })
  @IsOptional() @ValidateNested() @Type(() => BloodPressureDTO) bloodPressure?: BloodPressureDTO;

  @ApiPropertyOptional({ example: 95, description: 'Blood glucose in mg/dL' })
  @IsOptional() @IsNumber() glucose?: number;

  @ApiPropertyOptional({ example: 97, description: 'SpO2 percentage' })
  @IsOptional() @IsNumber() oxygenSaturation?: number;

  @ApiPropertyOptional({ example: 36.8, description: 'Body temperature in Celsius' })
  @IsOptional() @IsNumber() temperature?: number;

  @ApiPropertyOptional({ example: 7.5, description: 'Hours of sleep' })
  @IsOptional() @IsNumber() sleepHours?: number;

  @ApiPropertyOptional({ example: 6500, description: 'Step count' })
  @IsOptional() @IsNumber() steps?: number;

  @ApiPropertyOptional({ enum: VitalSource, example: VitalSource.MANUAL })
  @IsOptional() @IsEnum(VitalSource) source?: VitalSource;
}