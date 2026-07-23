import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AiChatMessage extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patient?: Types.ObjectId;

  @Prop({ required: true, enum: ['PATIENT', 'AI'] })
  sender?: string;

  @Prop({ required: true })
  content?: string;

  @Prop({ default: () => new Date() })
  sentAt?: Date;
}

export const AiChatMessageSchema = SchemaFactory.createForClass(AiChatMessage);
AiChatMessageSchema.index({ patient: 1, sentAt: 1 });