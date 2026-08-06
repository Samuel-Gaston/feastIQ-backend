import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { RestaurantStatusEnum } from "../../common/enums/restaurant.status";
import { User } from "../../user/schemas/user.schema";
import { Role } from "../../roles/schemas/role.schema";


@Schema({timestamps: true})
export class Restaurant extends Document{
   
    @Prop()
    name?:string;

    @Prop({unique: true})
    email?:string;

    @Prop({unique: true})
    password?:string;
  
    @Prop()
    description?:string;

    @Prop()
    cuisineTags?:string[];

    @Prop()
    logoURL?:string;

    @Prop()
    address?:string;

    @Prop()
    openingAndClosingHours?:string;

    @Prop()
    status?:RestaurantStatusEnum;

    @Prop()
    ratings?:string;

    @Prop({ type: Types.ObjectId, ref: 'User'})
    user?: User 

    @Prop({type: Types.ObjectId, ref:'Role'})
    role?: Role

}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant)
