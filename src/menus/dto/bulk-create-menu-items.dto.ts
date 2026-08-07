import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CreateMenuItemDTO } from "./create-menu-item.dto";

export class BulkCreateMenuItemsDTO{
    @ApiPropertyOptional({description:'admin only — restaurant id to bulk import dishes for'})
    restaurant?:string;

    @ApiProperty({type: [CreateMenuItemDTO], description:'list of dishes to import'})
    items?:CreateMenuItemDTO[];
}