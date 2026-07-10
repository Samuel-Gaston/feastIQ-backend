import { PartialType } from '@nestjs/mapped-types';
import { CreateDoctorDto } from './create-doctor.dto';

export class UpdateDoctorDto extends PartialType(CreateDoctorDto) {
  // You don't need to redeclare name, email, or password here.
  // PartialType handles the optionality for you.
}