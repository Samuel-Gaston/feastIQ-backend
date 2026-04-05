import { SchemaFactory, Schema } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Prop } from "@nestjs/mongoose";
import { AppointmentStatus } from "../../common/enums/appointment-status.enum";
import { ConsultationType } from "../../common/enums/consultation-type.enum";
import { Patient } from "../../patient/schemas/patient.schema";
import { Doctor } from "../../doctor/schemas/doctor.schema";



@Schema()
export class Appointment extends Document{

    @Prop({type: Types.ObjectId, ref:'Patient'})
    patient?:Patient;

    @Prop({type: Types.ObjectId, ref:'Doctor'})
    doctor?:Doctor;

    @Prop()
    scheduledAt?: Date;

    @Prop()
    status?: AppointmentStatus;

    @Prop()
    consultationType?: ConsultationType;

    @Prop()
    reason?:string;

    @Prop()
    notes?:string;


}


export const AppointmentSchema = SchemaFactory.createForClass(Appointment)