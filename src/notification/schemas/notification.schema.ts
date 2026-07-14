import { User } from "../../user/schemas/user.schema";
import { RoleEnum } from "../../common/enums/role.enum";
import { Document, Types } from "mongoose";
import { Prop, Schema } from "@nestjs/mongoose";
import { SchemaFactory } from "@nestjs/mongoose";


@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop()
  title?: string;

   @Prop()
  message?: string;

  @Prop({ default: false })
  isRead?: boolean;

 // If roles is an array of strings
@Prop({ type: [String], required: false })
roles?: string[];


   @Prop({type: Types.ObjectId, ref:'User'})
   userId?: User
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
