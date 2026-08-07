import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { RoleEnum } from "../../common/enums/role.enum";
import { NotificationTypeEnum } from "../../common/enums/notification-type.enum";

export class BroadcastNotificationDTO{
    @ApiProperty({description:'enter the notification title'})
    title?:string;

    @ApiProperty({description:'enter the notification body'})
    body?:string;

    @ApiPropertyOptional({description:'enter the notification type', enum: NotificationTypeEnum})
    type?:NotificationTypeEnum;

    @ApiPropertyOptional({description:'enter the deep link'})
    deepLink?:string;

    @ApiPropertyOptional({description:'target role, leave empty to broadcast to everyone', enum: RoleEnum})
    targetRole?:RoleEnum;
}