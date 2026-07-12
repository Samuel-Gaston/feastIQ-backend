import { ApiProperty } from "@nestjs/swagger";
import { AppointmentStatus } from "../../common/enums/appointment-status.enum";
import { ConsultationType } from "../../common/enums/consultation-type.enum";
import { IsOptional, IsNotEmpty, IsString, IsDateString, IsEnum } from "class-validator";

export class CreateAppointmentDTO {
  @ApiProperty({ description: 'Enter Id of the patient' })
  @IsNotEmpty()
  @IsString()
  patient?: string;

  @ApiProperty({ description: 'Enter Id of the doctor' })
  @IsNotEmpty()
  @IsString()
  doctor?: string;

  @ApiProperty({ description: 'Enter the scheduled date and time' })
  @IsNotEmpty()
  @IsDateString()
  scheduledAt?: Date;

  @ApiProperty({ description: 'Select the consultation type' })
  @IsOptional()
  @IsEnum(ConsultationType)
  consultationType?: ConsultationType;

  @ApiProperty({ description: 'Enter the reason for the appointment' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ description: 'Enter any additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}