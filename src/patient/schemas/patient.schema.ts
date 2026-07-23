import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Role } from "../../roles/schemas/role.schema";
import { User } from "../../user/schemas/user.schema";
import { Doctor } from "../../doctor/schemas/doctor.schema";


@Schema({timestamps:true})
export class Patient extends Document{
  @Prop()
  name?:string;

  @Prop({unique:true})
  email?:string;

  @Prop()
  password?:string;

  @Prop()
  phone?:string;

   @Prop()
  address?:string;

  @Prop({type: Types.ObjectId, ref: 'Role'})
  role?:Role;

  
  @Prop({type: Types.ObjectId, ref: 'User'})
  user?:User;

  @Prop({type: Types.ObjectId, ref: 'Doctor'})
  doctor?:Doctor;

  // patient/schemas/patient.schema.ts — add these props to the existing class
@Prop() age?: number;
@Prop() bmi?: number;
@Prop() gender?: string; // 'male' | 'female'
@Prop({ default: false }) chronicConditionFlag?: boolean;

}

export const PatientSchema = SchemaFactory.createForClass(Patient)