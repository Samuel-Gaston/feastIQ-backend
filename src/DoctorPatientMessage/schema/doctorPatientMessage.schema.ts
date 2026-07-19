import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export enum MessageType {
  TEXT   = 'TEXT',
  SYSTEM = 'SYSTEM', // e.g. "Dr. King started the consultation"
}

@Schema({ timestamps: true })
export class ChatMessage extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Appointment', required: true })
  appointment?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender?: Types.ObjectId;

  @Prop({ required: true })
  senderName?: string;

  @Prop({ required: true, enum: ['DOCTOR', 'PATIENT'] })
  senderRole?: string;

  @Prop({ required: true })
  content?: string;

  @Prop({
    type: String,
    enum: Object.values(MessageType),
    default: MessageType.TEXT,
  })
  messageType?: MessageType;

  @Prop({ default: () => new Date() })
  sentAt?: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

// Index for fast lookup by appointment
ChatMessageSchema.index({ appointment: 1, sentAt: 1 });