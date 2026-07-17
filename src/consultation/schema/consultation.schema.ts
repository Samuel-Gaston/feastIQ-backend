import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Appointment } from "../../appointment/schemas/appointment.schema";
import { Patient } from "../../patient/schemas/patient.schema";
import { Doctor } from "../../doctor/schemas/doctor.schema";


@Schema({ timestamps: true })
export class Consultation extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Appointment', required: true })
  appointment?: Appointment;

  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patient?: Patient;

  @Prop({ type: Types.ObjectId, ref: 'Doctor', required: true })
  doctor?: Doctor;

  @Prop({ required: true })
  diagnosis?: string;

  @Prop()
  treatmentPlan?: string;

  @Prop()
  clinicalNotes?: string;
}
export const ConsultationSchema = SchemaFactory.createForClass(Consultation);