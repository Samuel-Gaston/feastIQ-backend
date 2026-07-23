// ai/schemas/ai-profile.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";


@Schema({ timestamps: true })
export class AiProfile extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true, unique: true })
  patient?: Types.ObjectId;

  // ── Risk Prediction (Model 2) ──
  @Prop({ type: Object })
  riskScores?: { diabetes: number; hypertension: number; heartDisease: number };

  @Prop()
  riskComputedAt?: Date;

  // ── Anomaly Detection (Model 1) — per-patient baseline + model reference ──
  @Prop({ type: Object })
  baselineVitals?: {
    heartRate: { mean: number; std: number };
    systolic: { mean: number; std: number };
    diastolic: { mean: number; std: number };
    oxygenSaturation: { mean: number; std: number };
    glucose: { mean: number; std: number };
  };

  @Prop()
  anomalyModelPath?: string;

  @Prop()
  anomalyThreshold?: number;

  @Prop()
  anomalyModelTrainedAt?: Date;

  // Rolling history of recent anomaly checks — lets the frontend show
  // "3 anomalies flagged this week" without re-querying HealthLogs
  @Prop({ type: [{ timestamp: Date, score: Number, isAnomaly: Boolean }], default: [] })
  anomalyHistory?: { timestamp: Date; score: number; isAnomaly: boolean }[];
}

export const AiProfileSchema = SchemaFactory.createForClass(AiProfile);