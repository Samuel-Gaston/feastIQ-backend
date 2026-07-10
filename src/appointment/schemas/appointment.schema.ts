import { SchemaFactory, Schema, Prop } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { AppointmentStatus } from "../../common/enums/appointment-status.enum";
import { ConsultationType } from "../../common/enums/consultation-type.enum";
import { Patient } from "../../patient/schemas/patient.schema";
import { Doctor } from "../../doctor/schemas/doctor.schema";

@Schema({ timestamps: true })
export class Appointment extends Document {

    @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
    patient?: Patient;

    @Prop({ type: Types.ObjectId, ref: 'Doctor', required: true })
    doctor?: Doctor;

    @Prop({ required: true })
    scheduledAt?: Date;

    @Prop({ 
        type: String, 
        enum: Object.values(AppointmentStatus), 
        default: AppointmentStatus.Pending 
    })
    status?: AppointmentStatus;

    
    @Prop({ type: String })
    statusReason?: string;

    @Prop({ type: Date })
    proposedTime?: Date;

    @Prop({ type: String, enum: Object.values(ConsultationType) })
    consultationType?: ConsultationType;

    @Prop()
    reason?: string;

    @Prop()
    notes?: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);