import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";


@Schema({ timestamps: true })
export class Medication extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Prescription', required: true })
  prescription?: Types.ObjectId;

  @Prop({ required: true })
  name?: string;

  @Prop()
  dosage?: string;

  @Prop()
  frequency?: string;

  @Prop()
  schedule?: string;

  @Prop()
  duration?: string;

  @Prop()
  instruction?: string;

  @Prop()
  startDate?: Date;

  @Prop()
  endDate?: Date;
}

export const MedicationSchema = SchemaFactory.createForClass(Medication);