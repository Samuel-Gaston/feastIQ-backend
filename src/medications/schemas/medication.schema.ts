import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Prescription } from "../../prescription/schemas/prescriptions.schema";



@Schema({timestamps:true})
export class Medication extends Document{
    @Prop({type: Types.ObjectId, ref:'Prescription'})
    prescription?:Prescription

    @Prop()
    name?:string;

    @Prop()
    dosage?:string;

    @Prop()
    frequency?:string;

    @Prop()
    schedule?:string;

    @Prop()
    duration?:string;

    @Prop()
    instruction?:string;

    @Prop()
    startDate?:Date;

    @Prop()
    endDate?:Date;
}

export const MedicationSchema = SchemaFactory.createForClass(Medication) 