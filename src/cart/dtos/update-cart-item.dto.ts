import { ApiProperty } from "@nestjs/swagger";

export class UpdateCartItemDTO{
    @ApiProperty({description:'enter the new quantity'})
    quantity?:number;
}