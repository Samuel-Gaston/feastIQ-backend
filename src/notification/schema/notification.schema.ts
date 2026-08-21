import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { NotificationTypeEnum } from "../../common/enums/notification-type.enum";
import { User } from "../../user/schemas/user.schema";

@Schema({timestamps: true})
export class Notification extends Document{

    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true})
    user?: User

    @Prop({type: String, enum: NotificationTypeEnum, default: NotificationTypeEnum.SYSTEM})
    type?:NotificationTypeEnum;

    @Prop({required: true})
    title?:string;

    @Prop()
    body?:string;

    @Prop({default: false})
    isRead?:boolean;


}

export const NotificationSchema = SchemaFactory.createForClass(Notification)