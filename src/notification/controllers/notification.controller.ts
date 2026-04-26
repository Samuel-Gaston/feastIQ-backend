import {Controller,Get,Delete, Patch, Param, UseGuards,Query,} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse,ApiBearerAuth, ApiCookieAuth,} from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { RolesGuard } from '../../common/guards/role.guard';
import { NotificationService } from '../services/notification.service';
import { NotificationResponseDto } from '../dtos/notification-response.dto';
import { User } from '../../user/schemas/user.schema';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleEnum } from '../../common/enums/role.enum';
import { Roles } from '../../common/decorators/role.decorator';


@ApiTags('Notifications')
@ApiCookieAuth('authentication')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }


  @Get()
  async getMyNotifications(
    @CurrentUser() user: User,
    @I18n() i18n: I18nContext,
  ) {
    const response = await this.notificationService.getNotificationsForUser(user);
    const message = i18n.t('common.NOTIFICATIONS_FETCHED');
    return {data:response, message}
  }

  
  @Get('admin')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  async getAllNotifications(
    @I18n() i18n: I18nContext,
  ) {
    const result = await this.notificationService.getAllNotifications();
    const message = i18n.t('common.NOTIFICATIONS_FETCHED');
    return {data: result, message};
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  async readNotification(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @I18n() i18n: I18nContext,
  ) {
    const response = await this.notificationService.markAsRead(id, user);
    const message = i18n.t('common.NOTIFICATION_MARKED_AS_READ');
    return { data: response, message };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 200 })
  async deleteNotification(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @I18n() i18n: I18nContext,
  ) {
    const isAdmin = user.roles?.name === RoleEnum.ADMIN || user.roles?.name === RoleEnum.SUPER_ADMIN;
   const response =  await this.notificationService.deleteNotification(id, isAdmin ? undefined : user._id.toString());
    const message = i18n.t('common.NOTIFICATION_DELETED');
    return { data: response, message };
  }


  @Delete()
  @ApiOperation({ summary: 'Delete all notifications' })
  @ApiResponse({ status: 200 })
  async deleteAllNotifications(
    @CurrentUser() user: User,
    @I18n() i18n: I18nContext,
  ) {
    const response = await this.notificationService.deleteAllNotifications(user._id.toString());
    const message = i18n.t('common.NOTIFICATIONS_DELETED');
    return { data: response, message };
  }

  }

