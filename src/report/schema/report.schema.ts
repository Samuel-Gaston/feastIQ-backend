import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Report extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Role'})
  roles?: Types.ObjectId;

  @Prop({ required: true })
  subject?: string;

  @Prop({ required: true })
  description?: string;

  @Prop({ default: 'Medium' })
  priority?: string;

  @Prop({ default: 'pending' }) // 'pending', 'resolved'
  status?: string;
}

export const ReportSchema = SchemaFactory.createForClass(Report);