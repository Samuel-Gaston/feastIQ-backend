import { Prop, SchemaFactory } from "@nestjs/mongoose";
import { Patient } from "../../patient/schemas/patient.schema";
import { Types } from "mongoose";
import { Doctor } from "../../doctor/schemas/doctor.schema";
import { Appointment } from "../../appointment/schemas/appointment.schema";
import { Schema } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Medication } from "../../medications/schemas/medication.schema";

@Schema()
export class Prescription extends Document{

   @Prop({type: Types.ObjectId, ref:'Patient'})
   patient?:Patient;

   @Prop({type: Types.ObjectId, ref:'Doctor'})
   doctor?:Doctor;

   @Prop({type: Types.ObjectId, ref:'Appointment'})
   appointment?:Appointment;

   @Prop({type: Types.ObjectId, ref:'Medication'})
   medications?:Medication;

   @Prop()
   issuedAt?:Date;

   @Prop()
   expiresAt?:Date


}



export const PrescriptionSchema = SchemaFactory.createForClass(Prescription)