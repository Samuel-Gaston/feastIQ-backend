import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateRestaurantDTO } from './create-restaurant.dto';

export class UpdateRestaurantDTO extends PartialType(
  OmitType(CreateRestaurantDTO, ['email'] as const),
) {
}

