import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Role } from "../../roles/schemas/role.schema";
import { User } from "../../user/schemas/user.schema";
import { Permission } from "../../roles/schemas/permission.schema";
import { Document } from "mongoose";

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
    
    @Prop()
    specialization?:string;

    @Prop({unique:true})
    licenseNumber?:string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    user?: User; 

    @Prop({ type: Types.ObjectId, ref: 'Role' })
    role?:Role;

    // @Prop({ type: [{ type: Types.ObjectId, ref: 'Permission' }] })
    // permissions?: Permission[];

}


export const DoctorSchema = SchemaFactory.createForClass(Doctor);