import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";


export enum VitalSource {
  MANUAL = 'manual',
  WEARABLE = 'wearable',
  HEALTHKIT = 'healthkit',
  HEALTHCONNECT = 'healthconnect',
}

@Schema({ timestamps: true })
export class HealthLog extends Document {

  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patient?: Types.ObjectId;

  @Prop({ default: () => new Date() })
  timestamp?: Date;

  @Prop() heartRate?: number;

  @Prop({ type: { systolic: Number, diastolic: Number }, _id: false })
  bloodPressure?: { systolic: number; diastolic: number };

  @Prop() glucose?: number;
  @Prop() oxygenSaturation?: number;
  @Prop() temperature?: number;
  @Prop() sleepHours?: number;
  @Prop() steps?: number;

  @Prop({ type: String, enum: Object.values(VitalSource), default: VitalSource.MANUAL })
  source?: VitalSource;

  // Written by the AI anomaly service after inference — not set by the client
  @Prop({ default: false })
  anomalyFlag?: boolean;

  @Prop()
  anomalyScore?: number; // reconstruction error from LSTM Autoencoder
}

export const HealthLogSchema = SchemaFactory.createForClass(HealthLog);
HealthLogSchema.index({ patient: 1, timestamp: 1 });