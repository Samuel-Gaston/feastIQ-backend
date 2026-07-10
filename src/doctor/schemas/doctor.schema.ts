import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Role } from "../../roles/schemas/role.schema";
import { User } from "../../user/schemas/user.schema";
import { Permission } from "../../roles/schemas/permission.schema";
import { Document } from "mongoose";
import { Patient } from "../../patient/schemas/patient.schema";

@Schema({timestamps:true})
export class Doctor extends Document{
    @Prop()
    name?: string;

    @Prop({unique:true})
    email?: string;

    @Prop()
    phone?:string
    
    @Prop()
    address?:string;

    @Prop()
    country?:string;

     @Prop({ required: false })
    password?:string;
    
    @Prop()
    specialization?:string;

    @Prop({unique:true})
    licenseNumber?:string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    user?: User; 

    @Prop({ type: Types.ObjectId, ref: 'Role' })
    roles?:Role;

    @Prop({ type: Types.ObjectId, ref: 'Patient' })
    patient?: Patient[];

    

}


export const DoctorSchema = SchemaFactory.createForClass(Doctor);