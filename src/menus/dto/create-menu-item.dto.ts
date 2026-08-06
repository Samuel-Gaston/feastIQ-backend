import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { MenuItemCategoryEnum } from "../../common/enums/menu-item-category.enum";

export class CreateMenuItemDTO{
    @ApiProperty({description:'enter the name of the dish'})
    name?:string;

    @ApiProperty({description:'enter the description'})
    description?:string;

    @ApiProperty({description:'enter the category', enum: MenuItemCategoryEnum})
    category?:MenuItemCategoryEnum;

    @ApiProperty({description:'enter the price'})
    price?:number;

    @ApiProperty({description:'enter the photoUrl'})
    photoUrl?:string;

    @ApiProperty({description:'enter the tags'})
    tags?:string[];

    @ApiProperty({description:'enter the availability'})
    isAvailable?:boolean;

    @ApiProperty({description:'enter the prep time in minutes'})
    prepTimeMinutes?:number;

    @ApiPropertyOptional({description:'admin only — restaurant id to create this dish for'})
    restaurant?:string;
}