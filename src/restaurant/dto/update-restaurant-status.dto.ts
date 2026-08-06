import { ApiProperty } from "@nestjs/swagger";
import { RestaurantStatusEnum } from "../../common/enums/restaurant.status";

export class UpdateRestaurantStatusDTO{
    @ApiProperty({description:'enter the new status', enum: RestaurantStatusEnum})
    status?:RestaurantStatusEnum;
}