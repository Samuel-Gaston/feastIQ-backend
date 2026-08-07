import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { Customer } from "../../customer/schemas/customer.schema";

@Schema({_id: false})
export class ChatMessage{

    @Prop()
    role?:string;

    @Prop()
    content?:string;

    @Prop({default: () => new Date()})
    createdAt?:Date;

}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage)

@Schema({timestamps: true})
export class Chat extends Document{

    @Prop({ type: Types.ObjectId, ref: 'Customer', required: true, unique: true})
    customer?: Customer;

    @Prop({type: [ChatMessageSchema], default: []})
    messages?:ChatMessage[];

}

export const ChatSchema = SchemaFactory.createForClass(Chat)