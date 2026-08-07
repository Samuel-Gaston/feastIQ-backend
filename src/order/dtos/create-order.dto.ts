import { ApiProperty } from "@nestjs/swagger";

export class CreateOrderDTO{
    @ApiProperty({description:'enter the delivery address'})
    deliveryAddress?:string;
}