import { Prop, SchemaFactory } from "@nestjs/mongoose";
import { Patient } from "../../patient/schemas/patient.schema";
import { Types } from "mongoose";
import { Doctor } from "../../doctor/schemas/doctor.schema";
import { Document } from "mongoose";




export class Review extends Document{
    @Prop({type: Types.ObjectId, ref:'Patient'})
    patient?:Patient

    @Prop({type: Types.ObjectId, ref:'Doctor'})
    doctor?:Doctor

    @Prop()
    rating?:string

    @Prop()
    comment?:string;


}




export const ReviewSchema = SchemaFactory.createForClass(Review);