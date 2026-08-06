import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateMenuItemDTO } from './create-menu-item.dto';

export class UpdateMenuItemDTO extends PartialType(
  OmitType(CreateMenuItemDTO, ['description'] as const),
) {
}

