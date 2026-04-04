import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreatePatientDTO } from './create-patient.dto';

export class UpdatePatientDTO extends PartialType(
  OmitType(CreatePatientDTO, ['email'] as const),
) {
}

