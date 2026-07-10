import { IsEnum, IsOptional, IsDateString, IsString } from 'class-validator';
import {AppointmentStatus} from "../../common/enums/appointment-status.enum";

export class UpdateAppointmentStatusDTO {
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsDateString()
  newScheduledAt?: Date;
}