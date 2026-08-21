import { HttpException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Notification } from "../schema/notification.schema";
import { Model, Types } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { Role } from "../../roles/schemas/role.schema";
import { BroadcastNotificationDTO } from "../dto/broadcast-notification.dto";
import { HttpStatus } from "@nestjs/common";
import { NotificationTypeEnum } from "../../common/enums/notification-type.enum";


@Injectable()
export class NotificationService{
    constructor(
        @InjectModel(Notification.name)
        private readonly notificationModel: Model<Notification>,

        @InjectModel(User.name)
        private readonly userModel: Model<User>,

        @InjectModel(Role.name)
        private readonly roleModel: Model<Role>,
    ){}


    async send(userId: string, title: string, body?: string, type?: NotificationTypeEnum, deepLink?: string): Promise<Notification>{
        const notification = await this.notificationModel.create({
            user: new Types.ObjectId(userId),
            title,
            body,
            type: type ?? NotificationTypeEnum.SYSTEM,
            isRead: false
        })
        return notification
    }

    async getMyNotifications(user: User): Promise<Notification[]>{
        const notifications = await this.notificationModel
            .find({user: new Types.ObjectId(user._id.toString())})
            .sort({createdAt: -1})
        return notifications
    }

    async markAsRead(id: string, user: User): Promise<Notification>{
        const notification = await this.notificationModel.findById(id)
        if(!notification){
            throw new HttpException("Notification not found", HttpStatus.NOT_FOUND)
        }
        if(notification.user?.toString() !== user._id.toString()){
            throw new HttpException("This is not your notification", HttpStatus.FORBIDDEN)
        }

        notification.isRead = true
        await notification.save()
        return notification
    }

    async markAllAsRead(user: User): Promise<void>{
        await this.notificationModel.updateMany(
            {user: new Types.ObjectId(user._id.toString()), isRead: false},
            {isRead: true}
        )
    }

    async broadcast(dto: BroadcastNotificationDTO): Promise<{count: number}>{
        if(!dto.title){
            throw new HttpException("title is required", HttpStatus.BAD_REQUEST)
        }

        const filter: any = {}
        if(dto.targetRole){
            const role = await this.roleModel.findOne({name: dto.targetRole})
            if(!role){
                throw new HttpException("This role does not exist", HttpStatus.NOT_FOUND)
            }
            filter.roles = role._id
        }

        const users = await this.userModel.find(filter)
        if(users.length === 0){
            throw new HttpException("No users matched this broadcast", HttpStatus.NOT_FOUND)
        }

        const docs = users.map(targetUser => ({
            user: targetUser._id,
            title: dto.title,
            body: dto.body,
            type: dto.type ?? NotificationTypeEnum.PROMO,
            isRead: false
        }))

        await this.notificationModel.insertMany(docs)
        return {count: docs.length}
    }

}