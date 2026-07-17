import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Patient } from "../../patient/schemas/patient.schema";
import { Types, Document } from "mongoose";
import { Doctor } from "../../doctor/schemas/doctor.schema";
import { Appointment } from "../../appointment/schemas/appointment.schema";
import { Medication } from "../../medications/schemas/medication.schema";
 
@Schema({ timestamps: true }) 
export class Prescription extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patient?: Patient;

  @Prop({ type: Types.ObjectId, ref: 'Doctor', required: true })
  doctor?: Doctor;

  @Prop({ type: Types.ObjectId, ref: 'Appointment' })
  appointment?: Appointment;


  @Prop()
  notes?: string; 

  @Prop()
  issuedAt?: Date;

  @Prop()
  expiresAt?: Date;
}

export const PrescriptionSchema = SchemaFactory.createForClass(Prescription);
