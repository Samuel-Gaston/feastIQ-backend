import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { User } from '../../user/schemas/user.schema';
import { CreateNotificationDto } from '../dtos/create-notification.dto';
import { Notification } from '../schemas/notification.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    private readonly i18n: I18nService,
  ) {}


  async getNotificationsForUser(user: User): Promise<Notification[]> {
    return this.notificationModel
      .find({
        $or: [
          { userId: user._id },
          { role: { $in: [user['role']] } },
          { role: null, userId: null }, // global notifications
        ],
      })
      .sort({ createdAt: -1 });
  }

 

  async getAllNotifications(): Promise<Notification[]> {
    return this.notificationModel.find().sort({ createdAt: -1 });
  }

  

async saveNotification(dto: CreateNotificationDto): Promise<Notification> {
  const { title, message, roles, userId } = dto;

  const saved = await this.notificationModel.create({
    title,
    message,
    roles: roles ?? undefined, 
    userId: userId ? new Types.ObjectId(userId) : undefined,
    isRead: false,
  });

  return saved;
}



  async markAsRead(id: string, user: User): Promise<Notification> {
    const notification = await this.notificationModel.findById(id);
    if (!notification) {
      throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
    }

    notification.isRead = true;
    return notification.save();
  }



  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } },
    );
  }

 

async deleteNotification(id: string, userId?: string): Promise<void> {
  // 1. Find the notification first to verify existence
  const notification = await this.notificationModel.findById(id);
  
  if (!notification) {
    throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
  }

  // 2. Permission check: 
  // If userId exists (non-admin), check if the notification belongs to this user 
  // OR if it's a global notification (userId: null)
  if (userId && notification.userId && notification.userId.toString() !== userId) {
    throw new HttpException('Forbidden: You do not own this notification', HttpStatus.FORBIDDEN);
  }

  await this.notificationModel.findByIdAndDelete(id);
}

 

  async deleteAllNotifications(userId: string): Promise<void> {
    await this.notificationModel.deleteMany({ userId });
  }


  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      userId,
      isRead: false,
    });
  }


  async createTargetedNotification(userId: string | Types.ObjectId, title: string, message: string) {
  // Use 'userId' to match your Schema definition
  return await this.notificationModel.create({
    userId: new Types.ObjectId(userId), 
    title,
    message,
    isRead: false,
  });
}
}