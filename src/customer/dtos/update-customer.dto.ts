import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCustomerDTO } from './create-customer.dto';

export class UpdateCustomerDTO extends PartialType(
  OmitType(CreateCustomerDTO, ['email'] as const),
) {
}

