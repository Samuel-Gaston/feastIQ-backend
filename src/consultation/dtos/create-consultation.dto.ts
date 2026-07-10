import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class CreateConsultationDTO {
  @IsMongoId()
  @IsNotEmpty()
  appointmentId?: string;

  @IsString()
  @IsNotEmpty()
  diagnosis?: string;

  @IsString()
  treatmentPlan?: string;

  @IsString()
  clinicalNotes?: string;
}