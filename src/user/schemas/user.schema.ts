import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Permission } from "../../roles/schemas/permission.schema";
import { Role } from "../../roles/schemas/role.schema";
import { Customer } from "../../customer/schemas/customer.schema";

@Schema({timestamps:true})
export class User extends Document{
    @Prop()
    name?:string;

    @Prop({unique:true})
    email?:string;

    @Prop()
    password?:string;

    @Prop({default:true})
    isVerified?:boolean;

   @Prop({default:true})
   isActive?:boolean;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Permission' }] })
    permissions?: Permission[]; 

    @Prop({ type: Types.ObjectId, ref: 'Role' })
    roles?: Role;


    @Prop({ type: Types.ObjectId, ref: 'Customer' })
    customers?: Customer;

    @Prop() 
    refreshTokenHash?: string;

    

}

export const UserSchema = SchemaFactory.createForClass(User);