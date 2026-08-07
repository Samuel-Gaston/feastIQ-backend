import { Controller, Get, Param, Patch, Post, Body, UseGuards } from "@nestjs/common";
import { NotificationService } from "../service/notification.service";
import { BroadcastNotificationDTO } from "../dto/broadcast-notification.dto";
import { I18n, I18nContext } from "nestjs-i18n";
import { Roles } from "../../common/decorators/role.decorator";
import { RoleEnum } from "../../common/enums/role.enum";
import { PermissionCode } from "../../common/enums/permission.enum";
import { Permissions } from "../../common/decorators/permission.decorator";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/role.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { User } from "../../user/schemas/user.schema";


@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Notifications')
@ApiResponse({status:404, description:'NOT FOUND'})
@ApiResponse({ status: 400, description: "BAD_REQUEST" })
@ApiResponse({ status: 401, description: "UNAUTHORIZED" })
@ApiResponse({ status: 403, description: "FORBIDDEN" })
@ApiResponse({ status: 422, description: "VALIDATION_FAILED" })
@ApiResponse({ status: 500, description: "SERVER_ERROR" })
@Controller('notifications')
export class NotificationController{
    constructor(
        private readonly notificationService: NotificationService
    ){}


    @Get()
    @Roles(RoleEnum.ADMIN, RoleEnum.RESTAURANT, RoleEnum.CUSTOMER)
    @ApiOperation({summary: 'list notifications for the current user'})
    @ApiResponse({status: 200, description:'notifications fetched successfully'})
    async getMine(
        @CurrentUser() user: User,
        @I18n() i18n: I18nContext
    ){
        const response = await this.notificationService.getMyNotifications(user)
        const message = i18n.t("common.NOTIFICATION_READ")
        return {data:response, message}
    }

    @Patch(':id/read')
    @Roles(RoleEnum.ADMIN, RoleEnum.RESTAURANT, RoleEnum.CUSTOMER)
    @ApiOperation({summary: 'mark one notification as read'})
    @ApiResponse({status: 200, description:'notification marked as read'})
    async markAsRead(
        @Param('id') id: string,
        @CurrentUser() user: User,
        @I18n() i18n: I18nContext
    ){
        const response = await this.notificationService.markAsRead(id, user)
        const message = i18n.t("common.NOTIFICATION_READ_ONE")
        return {data:response, message}
    }

    @Patch('read-all')
    @Roles(RoleEnum.ADMIN, RoleEnum.RESTAURANT, RoleEnum.CUSTOMER)
    @ApiOperation({summary: 'mark all notifications as read'})
    @ApiResponse({status: 200, description:'notifications marked as read'})
    async markAllAsRead(
        @CurrentUser() user: User,
        @I18n() i18n: I18nContext
    ){
        await this.notificationService.markAllAsRead(user)
        const message = i18n.t("common.NOTIFICATION_READ_ALL")
        return {data:null, message}
    }

    @Post('broadcast')
    @Roles(RoleEnum.ADMIN)
    @Permissions(PermissionCode.NOTIFICATION_BROADCAST)
    @ApiOperation({summary: 'admin: send a platform-wide or role-targeted announcement'})
    @ApiResponse({status: 200, description:'broadcast sent successfully'})
    async broadcast(
        @Body() dto: BroadcastNotificationDTO,
        @I18n() i18n: I18nContext
    ){
        const response = await this.notificationService.broadcast(dto)
        const message = i18n.t("common.NOTIFICATION_BROADCAST_SENT")
        return {data:response, message}
    }

}