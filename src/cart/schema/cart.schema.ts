import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "../../user/schemas/user.schema";
import { Restaurant } from "../../restaurant/schema/restaurant.schema";

@Schema({_id: false})
export class CartItem{

    @Prop({ type: Types.ObjectId, ref: 'MenuItem', required: true})
    menuItem?:Types.ObjectId;

    @Prop()
    name?:string;

    @Prop()
    unitPrice?:number;

    @Prop({default: 1})
    quantity?:number;

}

export const CartItemSchema = SchemaFactory.createForClass(CartItem)

@Schema({timestamps: true})
export class Cart extends Document{

    @Prop({ type: Types.ObjectId, ref: 'User', required: true})
    customer?: User

    @Prop({ type: Types.ObjectId, ref: 'Restaurant'})
    restaurant?: Restaurant

    @Prop({type: [CartItemSchema], default: []})
    items?:CartItem[];

}

export const CartSchema = SchemaFactory.createForClass(Cart)