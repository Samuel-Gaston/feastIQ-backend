import { ApiProperty } from "@nestjs/swagger";
import { OrderStatusEnum } from "../../common/enums/order-status.enum";

export class UpdateOrderStatusDTO{
    @ApiProperty({description:'enter the new status', enum: OrderStatusEnum})
    status?:OrderStatusEnum;
}