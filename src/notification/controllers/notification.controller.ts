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
import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
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
async deleteNotification(@Param('id') id: string, @CurrentUser() user: User) {
  // If not logged in, you might want to return an error or restrict deletion
  if (!user || !user._id) {
    throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
  }

  // Check roles safely
  // Note: Ensure user.roles is populated in your JwtStrategy or wherever the user is loaded
  const roleName = user.roles?.name || user['role']; 
  const isAdmin = roleName === RoleEnum.ADMIN || roleName === RoleEnum.SUPER_ADMIN;

  // If Admin, pass undefined to delete any notification. If user, pass their _id.
  const response = await this.notificationService.deleteNotification(
    id, 
    isAdmin ? undefined : user._id.toString()
  );
  return { data: response };
}

@Delete()
async deleteAllNotifications(@CurrentUser() user: User) {
  if (!user || !user._id) {
    throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
  }
  
  await this.notificationService.deleteAllNotifications(user._id.toString());
  return { message: 'All notifications deleted' };
}

  }

