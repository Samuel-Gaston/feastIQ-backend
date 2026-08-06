import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { RestaurantStatusEnum } from "../../common/enums/restaurant.status";


export class CreateRestaurantDTO{
    @ApiProperty({description:'enter the name of the restaurant'})
    name?:string;

    @ApiProperty({description:"enter the email of the restaurant"})
    email?:string;

    @ApiProperty({description:' enter the password'})
    password?: string;

    @ApiProperty({description:'enter the description'})
    description?:string;

    @ApiProperty({description:'enter the address'})
    address?:string;

    @ApiProperty({description:'enter the cuisine tags'})
    cuisineTags?:string[];

    @ApiProperty({description:'enter the logoURL'})
    logoURL?:string;

    @ApiProperty({description:'enter the openingAndClosingHours'})
    openingAndClosingHours?:string;

    @ApiProperty({description: 'enter the status'})
    status?:RestaurantStatusEnum.PENDING

  
}

