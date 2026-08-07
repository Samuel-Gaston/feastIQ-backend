import { ApiProperty } from "@nestjs/swagger";

export class AddCartItemDTO{
    @ApiProperty({description:'enter the menu item id to add'})
    menuItemId?:string;

    @ApiProperty({description:'enter the quantity', default: 1})
    quantity?:number;
}